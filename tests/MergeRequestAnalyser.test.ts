import test from 'ava'
import { stub } from 'sinon'
import { update } from '../controllers/updatePoEditor'
import MergeRequestAnalyser from '../modules/MergeRequestAnalyser'
import POEditor from '../modules/PoEditor'
import Notifier from '../modules/Notifier'
import axios from 'axios'

test.before(t => {
  const changes = [
    {
      old_path: 'app/translations/en.json',
      new_path: 'app/translations/en.json',
      diff: '@@ -1677,7 +1677,7 @@\n     "old_term": "yes",\n     "old_term2": "no",\n-    "remove_term": "was removed",\n+    "new_term": "its new.",\n-    "modified_term": "old content.",\n+    "modified_term": "its changed.",\n     "still_old": old one",\n',
    },
  ]

  stub(axios, 'get').returns(new Promise((resolve) => {
    resolve({ data: { changes },
      status: 200,
      statusText: 'Accepted',
      headers: null,
      config: {},
    })
  }))

})

test('correctly parses added terms based on passed regex', async t => {
  const diffStringAdded = `@@ -1676,7 +1676,7 @@
+    "test_term": "content",
   "old_term": "its been there",
`
  const addedTerms = MergeRequestAnalyser.parseChanges(diffStringAdded, /^\+(.*),/gm, /^\+(.*),/)
  const expAddedTerms = { test_term: 'content' }

  t.deepEqual(addedTerms, expAddedTerms)
})

test('correctly parses removed terms based on passed regex', async t => {
  const diff = `@@ -1676,7 +1676,7 @@
-    "test_term_": "content",
   "old_term": "its been there",
`
  const removedTerms = MergeRequestAnalyser.parseChanges(diff, /^-(.*),/gm, /^-(.*),/)
  const expRemoved = {
    test_term: 'content',
  }

  t.deepEqual(expRemoved, expRemoved)
})

test('correctly parses strings without added or removed terms regex', async t => {
  const diff = `@@ -1676,7 +1676,7 @@
    "test_term": "content",
   "old_term": "its been there",
`
  const addedTerms = MergeRequestAnalyser.parseChanges(diff, /^\+(.*),/gm, /^\+(.*),/)
  const expAddedTerms = {}

  t.deepEqual(addedTerms, expAddedTerms)
})

test('returns translation changes in the proper structure', async t => {
  const translationChanges = await MergeRequestAnalyser.getTranslationChanges(1, 1)

  const expTranslationChanges = {
    translations: {
      en: {
        new_term: 'its new.',
        modified_term: 'its changed.',
      },
    },
    allAddedTerms: ['new_term'],
    allRemovedTerms: ['remove_term'],
  }
  t.deepEqual(translationChanges, expTranslationChanges)
})
