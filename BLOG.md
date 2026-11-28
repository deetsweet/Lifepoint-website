# How to add a blog post

Blog posts live in `src/blog/`, one file per post. Add a file there and, once it reaches the `main` branch on GitHub, it appears on the site about a minute later: on the Blog page, on the home page ("Latest from Lifepoint") and under other posts.

This works the same whether you add the file yourself on github.com or ask Claude (or another AI assistant) to do it.

## 1. Name the file

`YYYY-MM-DD-short-title.md`. For example:

```
2026-12-02-christmas-at-lifepoint.md
```

The words after the date become the web address: `/blog/christmas-at-lifepoint/`. Use lowercase and hyphens, no spaces.

## 2. Copy this template into the file

```markdown
---
title: Christmas at Lifepoint
date: 2026-12-02
author: jem
label: Church news
img: home-see-you-sunday
excerpt: One or two sentences shown on the blog list and the home page.
---

Your article goes here. Leave a blank line between paragraphs.

## A heading, if you want one

- A bullet point
- Another one

[A link to a page on this site](/events/)

**Your name**
```

### The settings at the top

| Setting | What to put |
|---|---|
| `title` | The post title, in normal sentence case. |
| `date` | The day it went out: `YYYY-MM-DD`. |
| `author` | One of `dan`, `jason`, `breyton`, `jem`. To add someone, add them to `src/_data/authors.json` (name, role and a photo name). |
| `label` | Exactly one of: `Sermon`, `From the team`, `Church news`. |
| `img` | A photo name from `src/_data/images.json` (for example `home-see-you-sunday`). Leave the line out if there's no photo. |
| `excerpt` | One or two sentences for the cards. |
| `video` | Sermons only: the YouTube video ID (the part after `watch?v=`). |
| `series`, `passage` | Sermons only, optional: shown under the title. |
| `ai: true` | Add this to AI-assisted summaries. It shows a small note at the end saying so. |

## 3. Copying from the weekly email

ChurchSuite emails show text in capitals, and copying keeps it that way. Retype or convert the text to normal sentence case before posting. (An AI assistant can do this: "convert this to sentence case, keeping names and Bible references capitalised".)

Leave out staff email addresses at the bottom of articles. The author card already shows who wrote it, and the Our Team page has contact details.

## 4. Special boxes (optional)

Paste these as they are, with a blank line before and after.

A prayer:

```html
<div class="prayer">

Lord, ...

Amen.

</div>
```

Discussion questions (for sermon summaries):

```html
<div class="questions">

## For groups and reflection

1. First question
2. Second question

</div>
```

Going deeper (Bible study questions for sermon summaries, after the group questions):

```html
<div class="questions questions--deeper">

## Going deeper

Bible study questions on the key passages from this message.

### Book 1:1–10 · Short heading

1. First question
2. Second question

</div>
```

A Bible verse:

```html
<blockquote class="verse"><p>Verse text.</p><p>Reference 1:2</p></blockquote>
```

## 5. Sermon summaries

- Always have the preacher read the summary before it goes live.
- Add `ai: true` if AI helped write it.
- If the video isn't on YouTube yet, leave `video` out. The post shows "The video of this message will be added here soon". Add the `video:` line once it's uploaded.

## Checking before it goes live

Anything saved to `main` goes straight to the live site. To check first, use Claude Code with the local preview (see README.md), or ask someone to look at the post on the live site straight after publishing and fix anything quickly.
