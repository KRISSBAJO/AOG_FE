"use client";

import { FormEvent, useEffect, useState } from "react";
import { Cloud, FileUp, MessageSquareText, RefreshCw, Trash2 } from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { Alert, Button, Card, CardHeader, Input, Textarea } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { Attachment, Comment, filesApi, StorageTargets } from "@/lib/api/files";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const entityTypes = [
  "CUSTOMER",
  "FACILITY",
  "SERVICE_REQUEST",
  "CONTRACT",
  "WORK_ORDER",
  "INSPECTION",
  "INVOICE",
  "PAYMENT",
  "EMPLOYEE",
  "COMPLAINT",
  "INCIDENT",
  "MESSAGE",
  "OTHER",
];

const documentTypes = ["CONTRACT", "INVOICE", "RECEIPT", "PHOTO", "ID_DOCUMENT", "CERTIFICATE", "INSPECTION_REPORT", "SIGNATURE", "OTHER"];

export default function FilesPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [storageTargets, setStorageTargets] = useState<StorageTargets | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentForm, setAttachmentForm] = useState({
    entityType: "OTHER",
    entityId: "general",
    documentType: "OTHER",
    url: "",
    fileName: "",
    mimeType: "",
  });
  const [commentForm, setCommentForm] = useState({ entityType: "OTHER", entityId: "general", body: "" });

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [storageResponse, attachmentResponse, commentResponse] = await Promise.all([
        filesApi.getStorageTargets(),
        filesApi.listAttachments({ take: 50 }),
        filesApi.listComments({ take: 50 }),
      ]);
      setStorageTargets(storageResponse);
      setAttachments(attachmentResponse.data);
      setComments(commentResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function createAttachment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const attachment = await filesApi.createAttachment({
        ...attachmentForm,
        mimeType: attachmentForm.mimeType || undefined,
      });
      setAttachmentForm((current) => ({ ...current, url: "", fileName: "", mimeType: "" }));
      setCommentForm((current) => ({
        ...current,
        entityType: attachment.entityType,
        entityId: attachment.entityId,
      }));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function createComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await filesApi.createComment(commentForm);
      setCommentForm((current) => ({ ...current, body: "" }));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function deleteAttachment(id: string) {
    setSaving(true);
    try {
      await filesApi.deleteAttachment(id);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Files</h1>
          <p className="mt-1 text-sm text-slate-500">{attachments.length} attachments and {comments.length} comments across operational records.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadData()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Storage targets" />
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><Cloud className="h-4 w-4 text-amber-500" />Direct URL</div>
                <p className="mt-2 text-xs text-slate-500">{storageTargets?.directUrl ? "enabled" : "disabled"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">S3</p>
                  <StatusPill status={storageTargets?.s3.configured ? "configured" : "pending"} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{storageTargets?.s3.bucket || "No bucket exposed"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">Cloudinary</p>
                  <StatusPill status={storageTargets?.cloudinary.configured ? "configured" : "pending"} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{storageTargets?.cloudinary.cloudName || "No cloud name exposed"}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Attachments" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">File</th>
                    <th className="px-5 py-3 font-medium">Entity</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Uploaded</th>
                    <th className="px-5 py-3 font-medium">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attachments.map((attachment) => (
                    <tr
                      key={attachment.id}
                      className="hover:bg-slate-50"
                      onClick={() => setCommentForm({ entityType: attachment.entityType, entityId: attachment.entityId, body: "" })}
                    >
                      <td className="px-5 py-3.5"><a className="font-medium text-slate-900 hover:text-amber-600" href={attachment.url} target="_blank" rel="noreferrer">{attachment.fileName}</a><p className="text-xs text-slate-400">{attachment.mimeType || "file"}</p></td>
                      <td className="px-5 py-3.5 text-slate-600">{attachment.entityType.toLowerCase()} / {attachment.entityId}</td>
                      <td className="px-5 py-3.5 text-slate-600">{attachment.documentType.toLowerCase()}</td>
                      <td className="px-5 py-3.5 text-slate-600">{new Date(attachment.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <Button type="button" size="sm" variant="ghost" disabled={saving} onClick={() => void deleteAttachment(attachment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!loading && attachments.length === 0 && <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={5}>No attachments found.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Comments" />
            <div className="grid gap-3 p-5 md:grid-cols-2">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquareText className="mt-0.5 h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-sm text-slate-700">{comment.body}</p>
                      <p className="mt-2 text-xs text-slate-400">{comment.entityType.toLowerCase()} / {comment.entityId}</p>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && comments.length === 0 && <p className="text-sm text-slate-500">No comments found.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Add attachment" />
            <form className="space-y-4 p-5" onSubmit={createAttachment}>
              <div className="grid grid-cols-2 gap-3">
                <select className={selectClass} value={attachmentForm.entityType} onChange={(event) => setAttachmentForm((current) => ({ ...current, entityType: event.target.value }))}>
                  {entityTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ").toLowerCase()}</option>)}
                </select>
                <select className={selectClass} value={attachmentForm.documentType} onChange={(event) => setAttachmentForm((current) => ({ ...current, documentType: event.target.value }))}>
                  {documentTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ").toLowerCase()}</option>)}
                </select>
              </div>
              <Input label="Entity id" value={attachmentForm.entityId} onChange={(event) => setAttachmentForm((current) => ({ ...current, entityId: event.target.value }))} required />
              <Input label="File URL" value={attachmentForm.url} onChange={(event) => setAttachmentForm((current) => ({ ...current, url: event.target.value }))} icon={<FileUp className="h-4 w-4" />} required />
              <Input label="File name" value={attachmentForm.fileName} onChange={(event) => setAttachmentForm((current) => ({ ...current, fileName: event.target.value }))} required />
              <Input label="MIME type" value={attachmentForm.mimeType} onChange={(event) => setAttachmentForm((current) => ({ ...current, mimeType: event.target.value }))} />
              <Button type="submit" loading={saving} fullWidth>Save attachment</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Add comment" />
            <form className="space-y-4 p-5" onSubmit={createComment}>
              <select className={selectClass} value={commentForm.entityType} onChange={(event) => setCommentForm((current) => ({ ...current, entityType: event.target.value }))}>
                {entityTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ").toLowerCase()}</option>)}
              </select>
              <Input label="Entity id" value={commentForm.entityId} onChange={(event) => setCommentForm((current) => ({ ...current, entityId: event.target.value }))} required />
              <Textarea label="Comment" value={commentForm.body} onChange={(event) => setCommentForm((current) => ({ ...current, body: event.target.value }))} required />
              <Button type="submit" loading={saving} fullWidth variant="outline">Save comment</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
