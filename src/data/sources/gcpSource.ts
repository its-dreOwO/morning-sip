// MOCK. Replace with GCP Billing/Monitoring APIs later — return the same GcpData shape.
export interface GcpData {
  spend: number;
  budget: number;
  breakdown: { name: string; value: number }[];
}

export function getMockGcp(): GcpData {
  return {
    spend: 612,
    budget: 1000,
    breakdown: [
      { name: "Compute", value: 400 },
      { name: "Storage", value: 150 },
      { name: "Network", value: 62 },
    ],
  };
}
