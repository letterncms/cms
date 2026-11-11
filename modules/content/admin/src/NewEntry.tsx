import { navigate, type SurfaceComponentProps } from '@letterncms/sdk'
import { Dialog, List, Row } from '@letterncms/ui'

interface Props { collection: string; locale?: string; title: string; kinds: { handle: string; title: string }[] }

/** New, where a collection's entries come in kinds: pick one and the editor opens on its fields. */
export default function NewEntry({ props, close }: SurfaceComponentProps<Props>) {
  // Put away without a choice: back to where New was pressed (a list closes it; the editor's own goes to the list).
  // The kind is in the address, also when it is the collection's own (`blueprint=`): the editor asks while there is none.
  const start = (kind: string) => {
    const query = new URLSearchParams({ blueprint: kind, ...(props.locale ? { locale: props.locale } : {}) })
    navigate(`/content/${props.collection}/new?${query}`)
  }
  return (
    <Dialog open onOpenChange={(open) => !open && close?.()} size="sm" title={props.title}>
      <List>
        {props.kinds.map((kind) => <Row key={kind.handle} onClick={() => start(kind.handle)}>{kind.title}</Row>)}
      </List>
    </Dialog>
  )
}
