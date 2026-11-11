import { run, t, timeAgo, useAction } from '@letterncms/sdk'
import { IconButton, QueryError, SidebarRow, Spinner, Tooltip, confirm, toast } from '@letterncms/ui'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Rename } from './Rename'
import { panel, usePanel } from './store'

type Summary = { id: string; title: string; updatedAt: string | null }
const pageSize = 30

function useChats() {
  const { working, thread, title } = usePanel()
  const history = useInfiniteQuery({
    queryKey: ['threads/list', 'pages'],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => run<Summary[]>('threads/list', { limit: pageSize, offset: pageParam }),
    getNextPageParam: (last, pages) => last.length === pageSize ? pages.length * pageSize : undefined,
  })
  const loaded = history.data?.pages.flat() ?? []
  // The thread on view is in the list even when it is older than the pages loaded so far (opened by its address).
  const saved = thread && history.data && !loaded.some((chat) => chat.id === thread)
    ? [{ id: thread, title, updatedAt: null }, ...loaded]
    : loaded
  const chats = working?.thread
    ? [{ id: working.thread, title: working.title, updatedAt: saved.find((chat) => chat.id === working.thread)?.updatedAt ?? null }, ...saved.filter((chat) => chat.id !== working.thread)]
    : saved
  return { history, chats }
}

function ChatRow({ chat, remove, renaming, onRename }: { chat: Summary; remove: (chat: Summary) => void; renaming: boolean; onRename: (on: boolean) => void }) {
  const { thread, working, drafts } = usePanel()
  const busy = working?.thread === chat.id
  const draft = !!drafts[chat.id]?.trim()
  if (renaming) {
    return <div data-chat-row={chat.id} className="px-1 py-0.5"><Rename id={chat.id} title={chat.title} onDone={(named) => {
      onRename(false)
      if (named && thread === chat.id) panel.set({ title: named })
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-chat-row="${chat.id}"] .cms-sidebar-row-main`)?.focus())
    }} /></div>
  }
  return (
    <div data-chat-row={chat.id}><SidebarRow
      label={chat.title || t('New Chat')}
      icon="comment"
      title={`${chat.title} · ${timeAgo(chat.updatedAt)}`}
      onClick={() => panel.select(chat.id)}
      active={thread === chat.id}
      status={busy || draft ? <>
        {busy && <span role="status" aria-label={t('Working…')}><Spinner size={12} /></span>}
        {draft && <span>{t('Draft')}</span>}
      </> : undefined}
      actions={[
        { label: t('Rename Chat'), icon: 'edit', onSelect: () => onRename(true) },
        { label: t('Delete Chat'), icon: 'trash', danger: true, quick: true, disabled: busy, onSelect: () => remove(chat) },
      ]}
    /></div>
  )
}

function useRemove(chats: Summary[]) {
  const { working } = usePanel()
  const next = useRef<string | null>(null)
  const remove = useAction<{ deleted: boolean }, { id: string }>('threads/delete', {
    invalidates: ['threads/list'],
    onSuccess: (_, { id }) => {
      panel.deleted(id)
      toast.success(t('Chat deleted'))
      // The focus goes on to the row that took its place.
      const to = next.current
      setTimeout(() => (to ? document.querySelector<HTMLElement>(`[data-chat-row="${to}"] .cms-sidebar-row-main`) : document.querySelector<HTMLElement>('.cms-thread-input'))?.focus(), 120)
    },
    onError: toast.error,
  })
  return async (chat: Summary) => {
    if (working?.thread === chat.id || remove.isPending) return
    const at = chats.findIndex((c) => c.id === chat.id)
    next.current = chats[at + 1]?.id ?? chats[at - 1]?.id ?? null
    if (await confirm({
      title: t('Delete “{title}”?', { title: chat.title || t('New Chat') }),
      description: t('This chat and its messages will be permanently deleted.'),
      confirm: t('Delete Chat'),
      danger: true,
    })) remove.mutate({ id: chat.id })
  }
}

/** The one list of threads, all of them, by age: where a new one starts, and a column of its own at full size. */
export function History() {
  const { history, chats } = useChats()
  const remove = useRemove(chats)
  const { drafts, working, thread, focusList } = usePanel()
  const [renaming, setRenaming] = useState<string | null>(null)
  const list = useRef<HTMLElement>(null)
  // All Chats moves the focus into the list: to the thread on view, or the first.
  useEffect(() => {
    if (!focusList) return
    const frame = requestAnimationFrame(() => (list.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? list.current?.querySelector<HTMLElement>('.cms-sidebar-row-main'))?.focus())
    return () => cancelAnimationFrame(frame)
  }, [focusList])
  const creating = working?.thread === null
  const unsent = drafts.new?.trim()
  const day = 86_400_000
  const today = new Date().setHours(0, 0, 0, 0)
  const groups = [
    { label: t('Today'), from: today },
    { label: t('Previous 7 Days'), from: today - 7 * day },
    { label: t('Older'), from: -Infinity },
  ].map((group, i, all) => ({
    ...group,
    chats: chats.filter((chat) => {
      const at = chat.updatedAt ? new Date(chat.updatedAt).getTime() : Date.now()
      return at >= group.from && (i === 0 || at < all[i - 1].from)
    }),
  })).filter((group) => group.chats.length > 0)

  // More of them as the list nears its end.
  const more = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const end = more.current
    if (!end) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && history.hasNextPage && !history.isFetchingNextPage) void history.fetchNextPage() }, { rootMargin: '200px' })
    observer.observe(end)
    return () => observer.disconnect()
  }, [history.hasNextPage, history.isFetchingNextPage, history.fetchNextPage])

  return (
    <nav ref={list} aria-label={t('Chats')} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4 pt-1">
      {/* A chat waiting to be sent, where it isn't already on view. */}
      {(creating || (unsent && thread !== null)) && (
        <SidebarRow
          label={(creating ? working.title : unsent) || t('New Chat')}
          onClick={() => panel.select(null)}
          active={thread === null}
          status={creating ? <span role="status" aria-label={t('Working…')}><Spinner size={12} /></span> : t('Draft')}
          actions={[!creating && { label: t('Discard Draft'), icon: 'close', quick: true, onSelect: () => panel.set({ drafts: { ...panel.get().drafts, new: '' } }) }]}
        />
      )}
      {groups.map((group) => (
        <section key={group.label} aria-label={group.label} className="mt-2 first:mt-0">
          <h3 className="m-0 flex h-7 items-center px-2 text-xs font-medium text-faint">{group.label}</h3>
          <div className="space-y-px">{group.chats.map((chat) => <ChatRow key={chat.id} chat={chat} remove={(c) => void remove(c)} renaming={renaming === chat.id} onRename={(on) => setRenaming(on ? chat.id : null)} />)}</div>
        </section>
      ))}
      {history.isPending && <div className="grid h-24 place-items-center text-faint"><Spinner /></div>}
      {history.isError && <QueryError compact message={t('Couldn’t load your chats')} onRetry={() => void history.refetch()} retrying={history.isRefetching} />}
      {history.hasNextPage && <div ref={more} className="grid h-10 place-items-center text-faint">{history.isFetchingNextPage && <Spinner size={14} />}</div>}
    </nav>
  )
}

export function NewChatButton() {
  return (
    <Tooltip content={t('New Chat')}>
      <IconButton icon="plus" label={t('New Chat')} title={undefined} onClick={() => panel.newChat()} />
    </Tooltip>
  )
}
