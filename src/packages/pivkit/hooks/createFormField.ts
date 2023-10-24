import { isUndefined } from '@edsolater/fnkit'
import { Accessify, createSyncSignal, deAccessify } from '..'
import { UseFormFieldOpts, FormField } from '../../../app/components/NavBar'

/**
 * hold form value
 * @param opts init confit
 */
export function createFormField<T>(opts: Omit<UseFormFieldOpts<T | undefined>, 'value'>): FormField<T | undefined>
export function createFormField<T>(opts: Omit<UseFormFieldOpts<T>, 'value'> & { value: Accessify<T> }): FormField<T>
export function createFormField(opts: UseFormFieldOpts<any>): FormField<any> {
  const [value, setValue] = createSyncSignal({
    getValueFromOutside: () => deAccessify(opts.value),
    onInvokeSetter: (to) => {
      opts.onChange?.(to)
    },
  })
  const isEmpty = () => {
    const v = value()
    return isUndefined(v) || v === ''
  }
  const isValid = () => (opts.validRule ? opts.validRule(value()) : true)

  return { value, setValue, isEmpty, isValid }
}
