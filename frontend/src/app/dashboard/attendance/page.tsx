// app/dashboard/attendance/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { AttendanceEntry, AttendanceFormState, AttendanceUpdatePayload } from "@/interfaces/attendance";


export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editEntry, setEditEntry] = useState<AttendanceEntry | null>(null);
  const [formState, setFormState] = useState<AttendanceFormState>({
    present: false,
    absent: false,
    lateEntry: "",
    earlyLeave: "",
    comment: "",
  });

  const qc = useQueryClient();

  // format date for API
  const dateStr = useMemo(
    () => selectedDate.toISOString().split("T")[0],
    [selectedDate]
  );

  // fetch attendance when refetch() is called
  const { data, isFetching, refetch } = useQuery<AttendanceEntry[]>({
    queryKey: ["attendance", dateStr],
    queryFn: () =>
      api
        .get("/attendance", { params: { date: dateStr } })
        .then((r) => r.data.data),
    enabled: false,
  });

  // group by class-section
  const grouped = useMemo(() => {
    if (!data) return {};
    return data.reduce<Record<string, AttendanceEntry[]>>((acc, e) => {
      const cls = e.student.currentClass;
      const sec = e.student.currentSection;
      const key = `Class ${cls}${sec ? `-${sec}` : ""}`;
      (acc[key] ||= []).push(e);
      return acc;
    }, {});
  }, [data]);

  // init formState whenever we pick an entry to edit
  useEffect(() => {
    if (editEntry) {
      setFormState({
        present: editEntry.present,
        absent: editEntry.absent,
        lateEntry: editEntry.lateEntry ?? "",
        earlyLeave: editEntry.earlyLeave ?? "",
        comment: editEntry.comment ?? "",
      });
    }
  }, [editEntry]);

  // mutation to update one record
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...rest
    }: {
      id: string;
      present: boolean;
      absent: boolean;
      lateEntry?: string;
      earlyLeave?: string;
      comment?: string;
    }) => api.put(`/attendance/${id}`, rest),
    onSuccess: () => {
      toast.success("Record updated");
      qc.invalidateQueries({ queryKey: ["attendance", dateStr] });
      setEditEntry(null);
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ error: { message: string } }>;
      const msg =
        axiosErr.response?.data?.error?.message ?? "Something went wrong";
      toast.error(`Update failed: ${msg}`);
    }
  });

  function handleSaveAttendance(
    editEntry: AttendanceEntry | null,
    formState: AttendanceFormState,
    mutate: (
      data: AttendanceUpdatePayload,
      options?: { onSuccess?: () => void }
    ) => void,
    onSuccess?: () => void
  ) {
    if (!editEntry) return;

    const payload: AttendanceUpdatePayload = {
      id: editEntry._id,
      present: formState.present,
      absent: formState.absent,
    };

    if (formState.lateEntry) payload.lateEntry = formState.lateEntry;
    if (formState.earlyLeave) payload.earlyLeave = formState.earlyLeave;
    if (formState.comment) payload.comment = formState.comment;

    mutate(payload, { onSuccess });
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>

      <div>
        <Link href="/dashboard/attendance/create">
          <Button>Create Attendance</Button>
        </Link>
      </div>

      {/* Date picker + fetch */}
      <div className="flex items-center space-x-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">{selectedDate.toDateString()}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => setSelectedDate(d!)}
            />
          </PopoverContent>
        </Popover>

        <Button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Loading…" : "Get Attendance Data"}
        </Button>
      </div>

      {/* No data message */}
      {data && Object.keys(grouped).length === 0 && (
        <div>No records for {dateStr}</div>
      )}

      {/* Results */}
      {Object.entries(grouped).map(([cls, entries]) => (
        <div key={cls}>
          <h2 className="text-xl font-semibold mb-2">{cls}</h2>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">Student</th>
                <th className="border px-2 py-1">Present</th>
                <th className="border px-2 py-1">Absent</th>
                <th className="border px-2 py-1">Late</th>
                <th className="border px-2 py-1">Early</th>
                <th className="border px-2 py-1">Comment</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e._id}>
                  <td className="border px-2 py-1">{e.student.name}</td>
                  <td className="border px-2 py-1 text-center">
                    {e.present ? "✔️" : ""}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {e.absent ? "❌" : ""}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {e.lateEntry ?? "-"}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {e.earlyLeave ?? "-"}
                  </td>
                  <td className="border px-2 py-1">{e.comment || "-"}</td>
                  <td className="border px-2 py-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditEntry(e)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Edit Modal */}
      <Dialog
        open={!!editEntry}
        onOpenChange={(open) => {
          if (!open) setEditEntry(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>Update the fields as needed.</DialogDescription>
          </DialogHeader>

          {/* Form */}
          <div className="space-y-4 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formState.present}
                onCheckedChange={(v) => {
                  const checked = v === true;
                  setFormState((s) => ({
                    ...s,
                    present: checked,
                    absent: checked ? false : s.absent,
                  }));
                }}
              />
              <Label>Present</Label>
            </div>

            <div className="flex items-center space-x-2">
              +{" "}
              <Checkbox
                checked={formState.absent}
                onCheckedChange={(v) => {
                  const checked = v === true;
                  setFormState((s) => ({
                    ...s,
                    absent: checked,
                    present: checked ? false : s.present,
                  }));
                }}
              />
              <Label>Absent</Label>
            </div>

            <div>
              <Label>Late Entry</Label>
              <Input
                type="time"
                value={formState.lateEntry}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, lateEntry: e.target.value }))
                }
                disabled={formState.absent}
              />
            </div>

            <div>
              <Label>Early Leave</Label>
              <Input
                type="time"
                value={formState.earlyLeave}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, earlyLeave: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Comment</Label>
              <Input
                value={formState.comment}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, comment: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={() =>
                handleSaveAttendance(
                  editEntry,
                  formState,
                  updateMutation.mutate,
                  () => {
                    refetch(); // ✅ refresh table
                    setEditEntry(null); // ✅ close modal
                  }
                )
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
