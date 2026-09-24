import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { ScenarioId } from './lib/scenarios'

function renderScenario(id: ScenarioId) {
  window.history.replaceState(null, '', `/?scenario=${id}`)
  const user = userEvent.setup()
  render(<App />)
  return user
}

const findHeadline = (name: RegExp | string) => screen.findByRole('heading', { level: 2, name })

describe('Order tracking screen', () => {
  it('shows a skeleton first, then the order', async () => {
    renderScenario('in-transit')
    expect(screen.getByText('Loading your order…')).toBeInTheDocument()
    expect(await findHeadline(/^Arriving/)).toBeInTheDocument()
    expect(screen.getByText('#VS-20418')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Delivery progress' })).toBeInTheDocument()
    expect(screen.getByText('Aura ANC Wireless Headphones')).toBeInTheDocument()
  })

  it('delayed: explains why, shows the new date and offers next steps', async () => {
    const user = renderScenario('delayed')
    expect(await findHeadline('Now arriving tomorrow')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: "Why it's late" })).toBeInTheDocument()
    expect(screen.getByText(/Originally/)).toBeInTheDocument()
    expect(screen.getByText(/You\s+can choose a full refund or a free replacement/)).toBeInTheDocument()

    const alerts = screen.getByRole('switch', { name: /Get delay alerts/ })
    await user.click(alerts)
    expect(alerts).toHaveAttribute('aria-checked', 'true')
    expect(await screen.findByText("We'll text you as soon as it moves")).toBeInTheDocument()
  })

  it('delivered but not received: report → investigation → found', async () => {
    const user = renderScenario('not-received')
    expect(await findHeadline("Let's find your package")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Report missing package' }))
    const dialog = await screen.findByRole('dialog', { name: 'Package not received' })
    await user.click(within(dialog).getByText(/^Refund \$/))
    await user.click(within(dialog).getByRole('button', { name: 'Submit report' }))

    expect(await within(dialog).findByText("We've got it from here")).toBeInTheDocument()
    const caseId = within(dialog)
      .getByText(/^#MP-\d{5}$/)
      .textContent!.slice(1)
    await user.click(within(dialog).getByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    expect(await findHeadline("We're looking into it")).toBeInTheDocument()
    expect(screen.getByText(`Case #${caseId}`)).toBeInTheDocument()
    expect(screen.getByText(/Refund of \$269\.54/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'I found it' }))
    expect(await screen.findByText("Glad it turned up! We've closed your case.")).toBeInTheDocument()
    expect(await findHeadline(/^Delivered/)).toBeInTheDocument()
  })

  it('delivered: the customer can say they cannot find it', async () => {
    const user = renderScenario('delivered')
    expect(await findHeadline('Delivered today')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: "No, can't find it" }))
    expect(await findHeadline("Let's find your package")).toBeInTheDocument()
    await user.click(screen.getAllByRole('checkbox')[0])
    expect(screen.getByText('1 of 4 done')).toBeInTheDocument()
  })

  it('tracking not available yet: never looks empty or broken', async () => {
    renderScenario('tracking-pending')
    expect(await findHeadline('Getting your order ready')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: "Tracking isn't available yet" })).toBeInTheDocument()
    expect(screen.getByText('Waiting for carrier pickup')).toBeInTheDocument()
    expect(screen.getByText('Assigned when your order ships')).toBeInTheDocument()
    expect(screen.getByText('Order placed')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy tracking number' })).not.toBeInTheDocument()
  })

  it('recovers from a failed load with "Try again"', async () => {
    const user = renderScenario('load-error')
    expect(await screen.findByRole('heading', { name: "We couldn't load your tracking info" })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await findHeadline(/^Arriving/)).toBeInTheDocument()
  })

  it('order not found: validates input and finds an order by number', async () => {
    const user = renderScenario('not-found')
    expect(await screen.findByRole('heading', { name: "We couldn't find that order" })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Find' }))
    expect(screen.getByText('Enter your order number')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Order number'), '19102')
    await user.click(screen.getByRole('button', { name: 'Find' }))
    expect(await findHeadline('Now arriving tomorrow')).toBeInTheDocument()
  })

  it('order details sheet is an accessible dialog that closes with Escape and restores focus', async () => {
    const user = renderScenario('in-transit')
    await findHeadline(/^Arriving/)
    const trigger = screen.getByRole('button', { name: 'View order details' })
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog', { name: 'Order details' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByText('$246.81')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })

  it('report form requires a description for "Something else"', async () => {
    const user = renderScenario('tracking-pending')
    await findHeadline('Getting your order ready')
    await user.click(screen.getByRole('button', { name: /Report a delivery issue/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Report a problem' })
    await user.click(within(dialog).getByText('Something else', { exact: true }))
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))

    await user.click(within(dialog).getByRole('button', { name: 'Submit report' }))
    const textarea = within(dialog).getByLabelText('Tell us what happened')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(within(dialog).getByText(/at least 10 characters/)).toBeInTheDocument()

    await user.type(textarea, 'Please add a gift note to this order.')
    await user.click(within(dialog).getByRole('button', { name: 'Submit report' }))
    expect(await within(dialog).findByText("We've got it from here")).toBeInTheDocument()
  })

  it('live chat answers with order context', async () => {
    const user = renderScenario('delayed')
    await findHeadline('Now arriving tomorrow')
    await user.click(screen.getByRole('button', { name: 'Chat with us' }))
    const dialog = await screen.findByRole('dialog', { name: /Maya/ })
    expect(within(dialog).getByText(/order #VS-19102 is delayed/)).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Message'), 'Where is my package?{Enter}')
    expect(await within(dialog).findByText(/Memphis hub/)).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Message')).toHaveFocus()
  })

  it('switching scenarios updates the URL and resets the screen', async () => {
    const user = renderScenario('in-transit')
    await findHeadline(/^Arriving/)
    await user.selectOptions(screen.getByLabelText('Demo'), 'delayed')
    expect(window.location.search).toBe('?scenario=delayed')
    expect(await findHeadline('Now arriving tomorrow')).toBeInTheDocument()
  })
})
