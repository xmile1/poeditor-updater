import test from 'ava'
import { stub } from 'sinon'
import { update } from '../controllers/updatePoEditor'
import MergeRequestAnalyser from '../modules/MergeRequestAnalyser'
import POEditor from '../modules/PoEditor'
import Notifier from '../modules/Notifier'

test.before(t => {
  stub(MergeRequestAnalyser, 'getTranslationChanges').returns(new Promise((resolve) => {
    resolve({ allAddedTerms: [],
      allRemovedTerms: [],
      translations: {},
    })
  }))
  stub(POEditor, 'addTerms')
  stub(POEditor, 'deleteTerms')
  stub(POEditor, 'addTranslations')
  stub(Notifier, 'sendToSlack')

})

test('sucessfully return 200 and translations with merge action and target master', async t => {

  const req = {
    body: JSON.stringify({
      project: {
        id: 1,
      },
      object_attributes: {
        action: 'merge',
        iid: 1,
        target_branch: 'master',
      },
    }),
  }

  const expectedResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'complete',
      translationChanges: {
        allAddedTerms: [],
        allRemovedTerms: [],
        translations: {},
      },
    }),
  }
  const res = await update(req, null, null)
  t.deepEqual(res, expectedResponse)
})

test('sucessfully return 200 and message skipped for for skipped triggers', async t => {

  const req = {
    body: JSON.stringify({
      project: {
        id: 1,
      },
      object_attributes: {
        action: 'created',
        iid: 1,
      },
    }),
  }

  const expectedResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'skipped',
    }),
  }
  const res = await update(req, null, null)
  t.deepEqual(res, expectedResponse)
})

test('sucessfully return 200 and message skipped for merged request to development', async t => {

  const reqMergedToMaster = {
    body: JSON.stringify({
      project: {
        id: 1,
      },
      object_attributes: {
        action: 'merge',
        iid: 1,
        target_branch: 'development',
      },
    }),
  }

  const expectedResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'skipped',
    }),
  }
  const res = await update(reqMergedToMaster, null, null)
  t.deepEqual(res, expectedResponse)
})

test('handles invalid JSON and return 500', async t => {

  const req = { body: JSON.stringify({}) }

  const res = await update(req, null, null)
  t.deepEqual(res.statusCode, 500)
})
