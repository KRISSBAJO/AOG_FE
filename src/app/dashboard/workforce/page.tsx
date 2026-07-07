"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, RefreshCw, Search, Users } from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { Button, Card, CardHeader, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { Department, Employee, Skill, workforceApi } from "@/lib/api/workforce";
import { toast } from "@/lib/toast";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const departmentTypes = [
  "CLEANING",
  "SECURITY",
  "PARKING",
  "EVENT",
  "OPERATIONS",
  "ADMIN",
  "FINANCE",
  "HR",
  "OTHER",
];
const employmentTypes = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACTOR",
  "TEMPORARY",
  "INTERN",
];
const serviceLines = [
  "CLEANING",
  "SECURITY",
  "PARKING",
  "EVENT_SETUP",
  "FACILITY_SUPPORT",
  "OTHER",
];

export default function WorkforcePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillSaving, setSkillSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    type: "OPERATIONS",
  });
  const [employeeForm, setEmployeeForm] = useState({
    departmentId: "",
    firstName: "",
    lastName: "",
    email: "",
    employmentType: "FULL_TIME",
    serviceLine: "CLEANING",
  });
  const [skillForm, setSkillForm] = useState({
    name: "",
    serviceLine: "CLEANING",
  });
  const [assignForm, setAssignForm] = useState({
    employeeId: "",
    skillId: "",
    level: "3",
  });

  async function loadData(nextSearch = search) {
    setLoading(true);
    try {
      const [departmentResponse, skillResponse, employeeResponse] =
        await Promise.all([
          workforceApi.listDepartments({ take: 100, isActive: true }),
          workforceApi.listSkills(),
          workforceApi.listEmployees({ take: 50, search: nextSearch }),
        ]);
      setDepartments(departmentResponse.data);
      setSkills(skillResponse);
      setEmployees(employeeResponse.data);
      setTotal(employeeResponse.meta.total);
      setEmployeeForm((current) => ({
        ...current,
        departmentId:
          current.departmentId || departmentResponse.data[0]?.id || "",
      }));
      setAssignForm((current) => ({
        ...current,
        employeeId: current.employeeId || employeeResponse.data[0]?.id || "",
        skillId: current.skillId || skillResponse[0]?.id || "",
      }));
    } catch (err) {
      toast.error(getErrorMessage(err), "Could not load workforce");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const department = await workforceApi.createDepartment(departmentForm);
      setDepartmentForm({ name: "", type: "OPERATIONS" });
      setEmployeeForm((current) => ({
        ...current,
        departmentId: department.id,
      }));
      toast.success(`${department.name} was created.`, "Department saved");
      await loadData(search);
    } catch (err) {
      toast.error(getErrorMessage(err), "Could not save department");
    } finally {
      setSaving(false);
    }
  }

  async function createEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        departmentId: employeeForm.departmentId || undefined,
        firstName: employeeForm.firstName,
        lastName: employeeForm.lastName,
        email: employeeForm.email || undefined,
        employmentType: employeeForm.employmentType,
        serviceLines: [employeeForm.serviceLine],
      };
      const employee = await workforceApi.createEmployee({
        ...payload,
      });
      setEmployeeForm((current) => ({
        ...current,
        firstName: "",
        lastName: "",
        email: "",
      }));
      setAssignForm((current) => ({ ...current, employeeId: employee.id }));
      toast.success(
        `${employee.firstName} ${employee.lastName} was created.`,
        "Employee saved",
      );
      await loadData(search);
    } catch (err) {
      toast.error(getErrorMessage(err), "Could not save employee");
    } finally {
      setSaving(false);
    }
  }

  async function createSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSkillSaving(true);
    try {
      const skill = await workforceApi.createSkill(skillForm);
      setSkillForm({ name: "", serviceLine: "CLEANING" });
      setAssignForm((current) => ({ ...current, skillId: skill.id }));
      toast.success(`${skill.name} was created.`, "Skill saved");
      await loadData(search);
    } catch (err) {
      toast.error(getErrorMessage(err), "Could not save skill");
    } finally {
      setSkillSaving(false);
    }
  }

  async function assignSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assignForm.employeeId || !assignForm.skillId) return;
    setSkillSaving(true);
    try {
      await workforceApi.assignSkill(assignForm.employeeId, {
        skillId: assignForm.skillId,
        level: Number(assignForm.level),
      });
      toast.success("Skill assignment was saved.", "Skill assigned");
      await loadData(search);
    } catch (err) {
      toast.error(getErrorMessage(err), "Could not assign skill");
    } finally {
      setSkillSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Workforce
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} employees across {departments.length} active departments.
          </p>
        </div>
        <form
          className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void loadData(search);
          }}
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employees"
            icon={<Search className="h-4 w-4" />}
          />
          <Button type="submit" variant="outline">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </form>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader title="Employee register" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Employee</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Service lines</th>
                  <th className="px-5 py-3 font-medium">Skills</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-slate-50"
                    onClick={() =>
                      setAssignForm((current) => ({
                        ...current,
                        employeeId: employee.id,
                      }))
                    }
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {employee.employeeNumber}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {employee.department?.name || "Not set"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {employee.employmentType
                        .replaceAll("_", " ")
                        .toLowerCase()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {employee.serviceLines.join(", ").toLowerCase()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {employee._count?.skills ?? 0}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={employee.status} />
                    </td>
                  </tr>
                ))}
                {!loading && employees.length === 0 && (
                  <tr>
                    <td
                      className="px-5 py-8 text-center text-slate-500"
                      colSpan={6}
                    >
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create department" />
            <form className="space-y-4 p-5" onSubmit={createDepartment}>
              <Input
                label="Department name"
                value={departmentForm.name}
                onChange={(event) =>
                  setDepartmentForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
              <select
                className={selectClass}
                value={departmentForm.type}
                onChange={(event) =>
                  setDepartmentForm((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
              >
                {departmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toLowerCase()}
                  </option>
                ))}
              </select>
              <Button type="submit" loading={saving} fullWidth>
                <Plus className="h-4 w-4" />
                Save department
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Create employee" />
            <form className="space-y-4 p-5" onSubmit={createEmployee}>
              <select
                className={selectClass}
                value={employeeForm.departmentId}
                onChange={(event) =>
                  setEmployeeForm((current) => ({
                    ...current,
                    departmentId: event.target.value,
                  }))
                }
              >
                <option value="">No department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First"
                  value={employeeForm.firstName}
                  onChange={(event) =>
                    setEmployeeForm((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                  required
                />
                <Input
                  label="Last"
                  value={employeeForm.lastName}
                  onChange={(event) =>
                    setEmployeeForm((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={employeeForm.email}
                onChange={(event) =>
                  setEmployeeForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={selectClass}
                  value={employeeForm.employmentType}
                  onChange={(event) =>
                    setEmployeeForm((current) => ({
                      ...current,
                      employmentType: event.target.value,
                    }))
                  }
                >
                  {employmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ").toLowerCase()}
                    </option>
                  ))}
                </select>
                <select
                  className={selectClass}
                  value={employeeForm.serviceLine}
                  onChange={(event) =>
                    setEmployeeForm((current) => ({
                      ...current,
                      serviceLine: event.target.value,
                    }))
                  }
                >
                  {serviceLines.map((line) => (
                    <option key={line} value={line}>
                      {line.replaceAll("_", " ").toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                loading={saving}
                fullWidth
                variant="secondary"
              >
                <Users className="h-4 w-4" />
                Save employee
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Skills" />
            <div className="space-y-4 p-5">
              <form className="space-y-3" onSubmit={createSkill}>
                <Input
                  label="Skill name"
                  value={skillForm.name}
                  onChange={(event) =>
                    setSkillForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="outline"
                  loading={skillSaving}
                >
                  Save skill
                </Button>
              </form>
              <form className="space-y-3" onSubmit={assignSkill}>
                <select
                  className={selectClass}
                  value={assignForm.employeeId}
                  onChange={(event) =>
                    setAssignForm((current) => ({
                      ...current,
                      employeeId: event.target.value,
                    }))
                  }
                >
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
                <select
                  className={selectClass}
                  value={assignForm.skillId}
                  onChange={(event) =>
                    setAssignForm((current) => ({
                      ...current,
                      skillId: event.target.value,
                    }))
                  }
                >
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  fullWidth
                  variant="ghost"
                  loading={skillSaving}
                  disabled={!assignForm.employeeId || !assignForm.skillId}
                >
                  Assign skill
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
