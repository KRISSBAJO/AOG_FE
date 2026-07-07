"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, MessageSquarePlus, RefreshCw, Send } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Alert, Button, Card, CardHeader, Input, Textarea } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import {
  communicationsApi,
  Conversation,
  DeliveryConfig,
  Message,
  Notification,
} from "@/lib/api/communications";
import { Customer, Facility, phase3Api } from "@/lib/phase3-api";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const conversationTypes = ["GENERAL", "CLIENT_INTERNAL", "SERVICE_REQUEST", "WORK_ORDER", "FACILITY", "ANNOUNCEMENT"];

export default function MessagesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationForm, setConversationForm] = useState({
    type: "GENERAL",
    customerId: "",
    facilityId: "",
    title: "",
  });
  const [participantForm, setParticipantForm] = useState({ displayName: "Operations", type: "SYSTEM" });
  const [messageForm, setMessageForm] = useState({ body: "", senderName: "Operations", visibility: "CLIENT_VISIBLE" });

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId),
    [conversations, selectedId],
  );

  async function loadData(nextSelectedId = selectedId) {
    setLoading(true);
    setError(null);
    try {
      const [customerResponse, facilityResponse, conversationResponse, notificationResponse, configResponse] = await Promise.all([
        phase3Api.listCustomers({ take: 100, status: "ACTIVE" }),
        phase3Api.listFacilities({ take: 100, status: "ACTIVE" }),
        communicationsApi.listConversations({ take: 50 }),
        communicationsApi.listNotifications({ take: 20 }),
        communicationsApi.getDeliveryConfig(),
      ]);
      const activeId = nextSelectedId || conversationResponse.data[0]?.id || "";
      setCustomers(customerResponse.data);
      setFacilities(facilityResponse.data);
      setConversations(conversationResponse.data);
      setNotifications(notificationResponse.data);
      setDeliveryConfig(configResponse);
      setSelectedId(activeId);
      setConversationForm((current) => ({ ...current, customerId: current.customerId || customerResponse.data[0]?.id || "" }));
      if (activeId) {
        const messageResponse = await communicationsApi.listMessages(activeId, { take: 50 });
        setMessages(messageResponse.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectConversation(id: string) {
    setSelectedId(id);
    setLoading(true);
    try {
      const messageResponse = await communicationsApi.listMessages(id, { take: 50 });
      setMessages(messageResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function createConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const conversation = await communicationsApi.createConversation({
        ...conversationForm,
        customerId: conversationForm.customerId || undefined,
        facilityId: conversationForm.facilityId || undefined,
      });
      setConversationForm((current) => ({ ...current, title: "" }));
      await communicationsApi.addParticipant(conversation.id, participantForm);
      await loadData(conversation.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function addParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    try {
      await communicationsApi.addParticipant(selectedId, participantForm);
      await loadData(selectedId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    try {
      await communicationsApi.addMessage(selectedId, {
        body: messageForm.body,
        senderName: messageForm.senderName || undefined,
        visibility: messageForm.visibility,
      });
      setMessageForm((current) => ({ ...current, body: "" }));
      await selectConversation(selectedId);
      await loadData(selectedId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function readAll() {
    setSaving(true);
    try {
      await communicationsApi.readAllNotifications();
      await loadData(selectedId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description={`${conversations.length} conversations and ${notifications.length} latest notifications.`}
        eyebrow="Collaboration"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void readAll()} disabled={saving}>
              <CheckCheck className="h-4 w-4" />
              Read all
            </Button>
            <Button type="button" variant="outline" onClick={() => void loadData(selectedId)}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
        <Card>
          <CardHeader title="Conversations" />
          <div className="divide-y divide-slate-100">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => void selectConversation(conversation.id)}
                className={`block w-full px-5 py-4 text-left hover:bg-slate-50 ${conversation.id === selectedId ? "bg-amber-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{conversation.title || conversation.type.replaceAll("_", " ").toLowerCase()}</p>
                    <p className="mt-1 text-xs text-slate-500">{conversation.customer?.name || conversation.facility?.name || "General thread"}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{conversation._count?.messages ?? 0}</span>
                </div>
              </button>
            ))}
            {!loading && conversations.length === 0 && <p className="p-5 text-sm text-slate-500">No conversations found.</p>}
          </div>
        </Card>

        <Card>
          <CardHeader title={selectedConversation?.title || "Conversation"} />
          <div className="max-h-[560px] space-y-3 overflow-y-auto p-5">
            {messages.map((message) => (
              <div key={message.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{message.senderName}</p>
                    <p className="text-xs text-slate-400">{new Date(message.createdAt).toLocaleString()}</p>
                  </div>
                  <StatusPill status={message.visibility} />
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{message.body}</p>
              </div>
            ))}
            {!loading && selectedId && messages.length === 0 && <p className="text-sm text-slate-500">No messages yet.</p>}
            {!selectedId && <p className="text-sm text-slate-500">Create or select a conversation.</p>}
          </div>
          <form className="border-t border-slate-100 p-5" onSubmit={sendMessage}>
            <Textarea label="Message" value={messageForm.body} onChange={(event) => setMessageForm((current) => ({ ...current, body: event.target.value }))} required />
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px_auto]">
              <Input value={messageForm.senderName} onChange={(event) => setMessageForm((current) => ({ ...current, senderName: event.target.value }))} placeholder="Sender" />
              <select className={selectClass} value={messageForm.visibility} onChange={(event) => setMessageForm((current) => ({ ...current, visibility: event.target.value }))}>
                <option value="CLIENT_VISIBLE">client visible</option>
                <option value="INTERNAL">internal</option>
              </select>
              <Button type="submit" loading={saving} disabled={!selectedId}>
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create conversation" />
            <form className="space-y-4 p-5" onSubmit={createConversation}>
              <Input label="Title" value={conversationForm.title} onChange={(event) => setConversationForm((current) => ({ ...current, title: event.target.value }))} icon={<MessageSquarePlus className="h-4 w-4" />} />
              <select className={selectClass} value={conversationForm.type} onChange={(event) => setConversationForm((current) => ({ ...current, type: event.target.value }))}>
                {conversationTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ").toLowerCase()}</option>)}
              </select>
              <select className={selectClass} value={conversationForm.customerId} onChange={(event) => setConversationForm((current) => ({ ...current, customerId: event.target.value }))}>
                <option value="">No customer</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
              <select className={selectClass} value={conversationForm.facilityId} onChange={(event) => setConversationForm((current) => ({ ...current, facilityId: event.target.value }))}>
                <option value="">No facility</option>
                {facilities.filter((facility) => !conversationForm.customerId || facility.customerId === conversationForm.customerId).map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
              </select>
              <Button type="submit" loading={saving} fullWidth>Create thread</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Participant" />
            <form className="space-y-4 p-5" onSubmit={addParticipant}>
              <Input label="Display name" value={participantForm.displayName} onChange={(event) => setParticipantForm((current) => ({ ...current, displayName: event.target.value }))} required />
              <select className={selectClass} value={participantForm.type} onChange={(event) => setParticipantForm((current) => ({ ...current, type: event.target.value }))}>
                <option value="SYSTEM">system</option>
                <option value="USER">user</option>
                <option value="EMPLOYEE">employee</option>
                <option value="CUSTOMER_CONTACT">customer contact</option>
              </select>
              <Button type="submit" loading={saving} fullWidth variant="outline" disabled={!selectedId}>Add participant</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Notifications" />
            <div className="space-y-3 p-5">
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <p>In-app: {deliveryConfig?.inApp ? "enabled" : "off"}</p>
                <p>Email: {deliveryConfig?.emailConfigured ? "configured" : "not configured"}</p>
              </div>
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start gap-3">
                    <Bell className="mt-0.5 h-4 w-4 text-amber-500" />
                    <div>
                      <p className="font-medium text-slate-900">{notification.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{notification.body || notification.type.toLowerCase()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
