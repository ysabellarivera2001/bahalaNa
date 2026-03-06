import { diagnostics, supportTickets } from "@/data/mockData";
import { DiagnosticResult, SupportTicket } from "@/types";

function pause(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDiagnostics(): Promise<DiagnosticResult> {
  await pause();
  return diagnostics;
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  await pause();
  return supportTickets;
}
