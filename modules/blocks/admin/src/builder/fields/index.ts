import { registry } from '@letterncms/sdk'
import { ColorField } from '../color'
import { BindField } from '../content/BindField'
import { GroupField, PairsField } from './composite'
import { NodeField, NodesField } from './nodes'
import { ConditionsField } from './conditions'
import { InlineTextField } from './inlineText'
import { SpacingField } from './spacing'
import { TokenField } from './token'
import { AlignField, GradientField, OriginField } from './style'

/** The inspector's field components; panels describe their controls as field definitions using these keys. */
export function registerFields() {
  const fields = {
    'blocks-token': TokenField,
    'blocks-color': ColorField,
    'blocks-bind': BindField,
    'blocks-node': NodeField,
    'blocks-nodes': NodesField,
    'blocks-group': GroupField,
    'blocks-pairs': PairsField,
    'blocks-gradient': GradientField,
    'blocks-align': AlignField,
    'blocks-origin': OriginField,
    'blocks-spacing': SpacingField,
    'blocks-conditions': ConditionsField,
    'blocks-inline-text': InlineTextField,
  }
  for (const [key, component] of Object.entries(fields)) registry.fields.set(key, component)
}
