import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

/**
 * POST /api/import — Import attendance data from an uploaded Excel file
 * 
 * Expected Excel structure:
 * - Row 1: Headers — Emp ID | Emp Name | Shift | Hourly Rate | OT Rate | "01-Jan (Thu)" | ... 
 * - Row 2: Sub-headers — for each date: In Time | Out Time | Work Hours | Overtime | Status
 * - Row 3+: Employee data
 * - Each date has 5 sub-columns starting at column 6 (0-indexed: 5)
 * - Date header format: "DD-Mon (Day)" e.g. "01-Jan (Thu)"
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const results: {
            employeesCreated: number;
            employeesUpdated: number;
            attendanceRecords: number;
            sheetName: string;
            errors: string[];
        } = {
            employeesCreated: 0,
            employeesUpdated: 0,
            attendanceRecords: 0,
            sheetName: "",
            errors: [],
        };

        for (const sheetName of workbook.SheetNames) {
            results.sheetName = sheetName;
            const ws = workbook.Sheets[sheetName];
            const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

            // Parse year from sheet name (e.g., "Jan2026" -> 2026, month "Jan" -> 0)
            const sheetMatch = sheetName.match(/^([A-Za-z]+)(\d{4})$/);
            if (!sheetMatch) {
                results.errors.push(`Could not parse year from sheet name: ${sheetName}`);
                continue;
            }

            const monthStr = sheetMatch[1];
            const year = parseInt(sheetMatch[2]);
            const monthMap: Record<string, number> = {
                Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
            };
            const monthIndex = monthMap[monthStr];
            if (monthIndex === undefined) {
                results.errors.push(`Unknown month in sheet name: ${monthStr}`);
                continue;
            }

            // Collect date headers from row 1 (starting col 5, 0-indexed)
            const dateColumns: { col: number; day: number }[] = [];
            for (let c = 5; c <= range.e.c; c++) {
                const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
                if (cell && typeof cell.v === "string") {
                    const dateMatch = cell.v.match(/^(\d{2})-/);
                    if (dateMatch) {
                        dateColumns.push({ col: c, day: parseInt(dateMatch[1]) });
                    }
                }
            }

            // Process each employee row (starting from row 3, i.e. index 2)
            for (let r = 2; r <= range.e.r; r++) {
                const getVal = (c: number) => {
                    const cell = ws[XLSX.utils.encode_cell({ r, c })];
                    return cell ? cell.v : null;
                };

                const empId = getVal(0);
                const empName = getVal(1);
                const shift = getVal(2);
                const hourlyRate = getVal(3);

                if (!empId || !empName) continue;

                // Upsert employee
                const empIdStr = String(empId).trim();
                const existing = await prisma.employee.findUnique({
                    where: { id: empIdStr },
                });

                if (existing) {
                    await prisma.employee.update({
                        where: { id: empIdStr },
                        data: {
                            name: String(empName).trim(),
                            shift: String(shift || "Day").trim(),
                            hourlyRate: parseFloat(String(hourlyRate || "0")),
                            isActive: true,
                        },
                    });
                    results.employeesUpdated++;
                } else {
                    await prisma.employee.create({
                        data: {
                            id: empIdStr,
                            name: String(empName).trim(),
                            shift: String(shift || "Day").trim(),
                            hourlyRate: parseFloat(String(hourlyRate || "0")),
                        },
                    });
                    results.employeesCreated++;
                }

                // Process each date for this employee
                for (const dc of dateColumns) {
                    const inTimeVal = getVal(dc.col);      // In Time
                    const outTimeVal = getVal(dc.col + 1);  // Out Time

                    // Convert time values to "HH:MM" string
                    const inTime = parseTimeValue(inTimeVal);
                    const outTime = parseTimeValue(outTimeVal);

                    // Only create a record if there's at least an in or out time
                    if (!inTime && !outTime) continue;

                    const date = new Date(year, monthIndex, dc.day);

                    try {
                        await prisma.attendanceRecord.upsert({
                            where: {
                                employeeId_date: {
                                    employeeId: empIdStr,
                                    date: date,
                                },
                            },
                            update: {
                                inTime,
                                outTime,
                                manualExtraHours: 0,
                            },
                            create: {
                                employeeId: empIdStr,
                                date: date,
                                inTime,
                                outTime,
                                manualExtraHours: 0,
                            },
                        });
                        results.attendanceRecords++;
                    } catch (err) {
                        results.errors.push(
                            `Failed to save record for ${empIdStr} on day ${dc.day}: ${err}`
                        );
                    }
                }
            }
        }

        return NextResponse.json(results, { status: 201 });
    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json(
            { error: "Failed to import file: " + String(error) },
            { status: 500 }
        );
    }
}

/**
 * Parse a time value from Excel into "HH:MM" string.
 * Excel stores times as fractional days (0.375 = 09:00, 0.75 = 18:00)
 * or as timedelta-like serial numbers.
 */
function parseTimeValue(val: unknown): string | null {
    if (val === null || val === undefined || val === "") return null;

    // If it's a number (Excel serial time fraction)
    if (typeof val === "number") {
        // Excel stores time as fraction of day (0.0 = 00:00, 1.0 = 24:00)
        const totalMinutes = Math.round(val * 24 * 60);
        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
    }

    // If it's already a string like "09:00"
    if (typeof val === "string") {
        const match = val.match(/^(\d{1,2}):(\d{2})/);
        if (match) {
            return `${match[1].padStart(2, "0")}:${match[2]}`;
        }
    }

    return null;
}
