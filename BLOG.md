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
| `img` | A photo name from `src/_data/images.json` (for example `home-see-you-sunday`). Every post should have one, sermons included. It shows as a thin banner (4 wide by 1 high) above the title, so pick a photo that still reads when cropped to a strip. See "Photos" below. |
| `excerpt` | One or two sentences for the cards. |
| `video` | Sermons only, optional: the YouTube video ID (the part after `watch?v=`). Add it once the video is uploaded; the post doesn't need to wait for it. |
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
- Post the summary early, from the preacher's notes or a transcript, so small groups have it in the week of the message. Don't wait for YouTube: videos often go up a week or more later.
- Until there's a video, leave `video` out. The post shows its photo with "The video of this message will be added here soon". Add the `video:` line once it's uploaded and the video appears at the top of the post, and a "Read the summary" link appears under it on Watch & listen.
- Give sermons a photo like any other post (`img`). YouTube thumbnails aren't used, so the photo doesn't change when the video arrives.

## 6. Photos

- Use a real Lifepoint photo when one clearly fits the post, otherwise a free stock photo of an object or scene that echoes the main idea (bread for a message about being hungry, coffee cups for a story about welcome). Avoid stock photos of people, who could be mistaken for Lifepoint people.
- Stock photos: use Unsplash photos marked "Free to use", never Unsplash+ (paid). Save the photo about 1600 pixels wide into `src/assets/img/blog/`, then add it to `src/_data/images.json` with a `credit` (the photographer's name) and `creditUrl` (the photo's Unsplash page). The post then shows "Photo: name on Unsplash" at the end.
- Photos are cropped to a 4:1 strip. If heads or the important part get cut off, add `imgPos: center 25%` (or similar) under `img:` in the post. Lower percentages move the crop up the photo. This only affects that post, not other pages using the same photo.

## Checking before it goes live

Anything saved to `main` goes straight to the live site. To check first, use Claude Code with the local preview (see README.md), or ask someone to look at the post on the live site straight after publishing and fix anything quickly.
