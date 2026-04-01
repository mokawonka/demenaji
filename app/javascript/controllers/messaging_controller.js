import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["convItem", "textarea"]

  connect() {
    this._scrollToBottom()
  }

  // ── Load a conversation ────────────────────────────────────

  loadConversation(event) {
    const item = event.currentTarget
    const conversationId = item.dataset.conversationId

    // Highlight active item
    this.convItemTargets.forEach(el => el.classList.remove("active"))
    item.classList.add("active")

    // Clear unread badge
    item.querySelector(".unread-badge")?.remove()
    item.querySelector(".conv-preview")?.classList.remove("unread")

    // Show frame, hide empty state
    document.getElementById("chat-empty-state").style.display = "none"
    const frame = document.getElementById("chat-frame")
    frame.style.cssText = "display:flex; flex:1; flex-direction:column; min-height:0;"

    // Fetch conversation HTML from server
    fetch(`/conversations/${conversationId}`, {
      headers: { "Accept": "text/html", "X-Requested-With": "XMLHttpRequest" },
      credentials: "same-origin"
    })
    .then(r => r.text())
    .then(html => {
      const doc   = new DOMParser().parseFromString(html, "text/html")
      const inner = doc.getElementById("chat-frame-inner")
      if (inner) frame.innerHTML = inner.innerHTML
      this._scrollToBottom()
      history.pushState({}, "", `/conversations/${conversationId}`)
    })
    .catch(err => console.error("Messaging load error:", err))

    document.querySelector(".msg-shell").classList.add("show-chat")
  }

  // ── Filter conversation list ───────────────────────────────

  filterConversations(event) {
    const query = event.target.value.toLowerCase()
    this.convItemTargets.forEach(item => {
      const name = item.querySelector(".conv-name")?.textContent.toLowerCase() ?? ""
      item.style.display = name.includes(query) ? "" : "none"
    })
  }

  // ── Textarea helpers ───────────────────────────────────────

  submitOnEnter(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      this._submitForm()
    }
  }

  autoResize(event) {
    const el = event.target
    el.style.height = ""
    el.style.height = Math.min(el.scrollHeight, 110) + "px"
  }

  // Called from the send button
  submitForm(event) {
    event.preventDefault()
    this._submitForm()
  }

  backToList(event) {
    document.querySelector(".msg-shell").classList.remove("show-chat")
  }

  // ── Internal ───────────────────────────────────────────────

  _submitForm() {
    const form = document.getElementById("message-form")
    if (!form) return

    const ta   = form.querySelector("textarea")
    const body = ta?.value?.trim()
    if (!body) return

    // Build nested params matching Rails: params.require(:message)
    const data = new FormData()
    data.append("message[body]",            body)
    data.append("message[recipient_id]",    form.querySelector("[name='message[recipient_id]']")?.value)
    data.append("message[conversation_id]", form.querySelector("[name='message[conversation_id]']")?.value)

    fetch(form.action, {
      method: "POST",
      headers: {
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
        "Accept": "application/json"
      },
      body: data,
      credentials: "same-origin"
    })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
    .then(msg => {
      this._appendMessage(msg)
      if (ta) { ta.value = ""; ta.style.height = "" }
    })
    .catch(err => console.error("Send error:", err))
  }

  _appendMessage(msg) {
    const win = document.getElementById("chat-window")
    if (!win) return

    const row = document.createElement("div")
    row.className = `msg-row ${msg.is_mine ? "sent" : "recv"}`
    row.id = `message_${msg.id}`

    row.innerHTML = msg.is_mine
      ? `<div class="bubble">${this._escape(msg.body)}<span class="bubble-time">${msg.time}</span></div>`
      : `<div class="bubble-avatar">${msg.sender_initials}</div>
         <div class="bubble">${this._escape(msg.body)}<span class="bubble-time">${msg.time}</span></div>`

    win.appendChild(row)
    win.scrollTop = win.scrollHeight
  }

  _escape(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }

  _scrollToBottom() {
    const win = document.getElementById("chat-window")
    if (win) win.scrollTop = win.scrollHeight
  }
}