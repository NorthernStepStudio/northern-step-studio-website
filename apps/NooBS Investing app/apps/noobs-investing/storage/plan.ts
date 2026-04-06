import { one, run } from "./db";

export type PlanRow = {
    stage: string;
    contribution_amount: number;
    frequency: "weekly" | "biweekly" | "monthly";
    allocation_template: "conservative" | "balanced" | "aggressive";
};

export async function getPlan(): Promise<PlanRow> {
    const row = await one<any>(`SELECT stage, contribution_amount, frequency, allocation_template FROM plan WHERE id=1;`);
    return {
        stage: row?.stage ?? "Not set",
        contribution_amount: Number(row?.contribution_amount ?? 0),
        frequency: (row?.frequency ?? "weekly") as PlanRow["frequency"],
        allocation_template: (row?.allocation_template ?? "balanced") as PlanRow["allocation_template"],
    };
}

export async function savePlan(p: PlanRow) {
    await run(
        `UPDATE plan
        SET stage=?, contribution_amount=?, frequency=?, allocation_template=?
        WHERE id=1;`,
        [p.stage, p.contribution_amount, p.frequency, p.allocation_template]
    );
}
