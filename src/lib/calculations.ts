/**
 * Calculate work hours from In Time and Out Time strings.
 * Format: "HH:MM" (24-hour)
 * Returns hours as a float (e.g., 8.5 for 8 hours 30 minutes)
 */
export function calculateWorkHours(
    inTime: string | null,
    outTime: string | null
): number {
    if (!inTime || !outTime) return 0;

    const [inH, inM] = inTime.split(":").map(Number);
    const [outH, outM] = outTime.split(":").map(Number);

    const inMinutes = inH * 60 + inM;
    let outMinutes = outH * 60 + outM;

    // Handle overnight shifts (e.g., in at 22:00, out at 06:00)
    if (outMinutes < inMinutes) {
        outMinutes += 24 * 60;
    }

    const diffMinutes = outMinutes - inMinutes;
    return Math.round((diffMinutes / 60) * 100) / 100;
}

/**
 * Derive attendance status from work hours.
 */
export function deriveStatus(
    workHours: number,
    inTime: string | null,
    outTime: string | null
): "Present" | "Half Day" | "Short Day" | "Absent" {
    if (!inTime && !outTime) return "Absent";
    if (workHours >= 7) return "Present";
    if (workHours >= 4) return "Half Day";
    if (workHours > 0) return "Short Day";
    return "Absent";
}

/**
 * Calculate total payable hours.
 */
export function calculatePayableHours(
    workHours: number,
    extraHours: number
): number {
    return Math.round((workHours + extraHours) * 100) / 100;
}

/**
 * Calculate total pay.
 */
export function calculateTotalPay(
    payableHours: number,
    hourlyRate: number
): number {
    return Math.round(payableHours * hourlyRate * 100) / 100;
}

/**
 * Format hours to display string (e.g., 8.5 -> "8h 30m")
 */
export function formatHours(hours: number): string {
    if (hours === 0) return "0h";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
}
