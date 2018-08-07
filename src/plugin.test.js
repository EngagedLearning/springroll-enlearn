import { setupPlugin, teardownPlugin } from './plugin'

test('setupPlugin creates app.enlearn', async () => {
  const app = {}
  await setupPlugin(app)
  expect(app.enlearn).toBeDefined()
})

test('teardownPlugin deletes app.enlearn', async () => {
  const app = { enlearn: 123 }
  await teardownPlugin(app)
  expect(app.enlearn).not.toBeDefined()
})
