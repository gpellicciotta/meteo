# Project Planning

An overview of all tasks and their planning.

> Tasks are split by milestone, with backlog being the list of all tasks that are not planned yet.
> See coordinating work guidelines for the full coordination protocol.
> Task notation works as follows and consists of 4 parts:
> 1. The first part is just a dash and status indicator:
>    - `[ ]` means the task is available (and maybe ready if all its start-conditions are met)
>    - `[~]` means the task is in progress. It should then always minimally also have an owner
>    - `[!]` means the task is currently suspended. This might mean it failed to finish once started, or it needs review.
>    - `[x]` means the task is finished and completed successfully
>    - `[-]` means the task is cancelled because it is no longer needed
> 2. The task ID is always of the form `Tnnnn`.
> 3. Task meta-data is given as further `[{{label}}: {{value}}]` blocks.
>    Following labels are used most-often:
>    - `owner`: To indicate the assignee of the task.
>               The value can be simply a name - for a human assignee - or the name of an agent, together with a `session-id`
>    - `needs`: Indicating start conditions, typically a list of other tasks IDs but can also be a date/time or some other start-condition.
>               For a suspended task, it will indicate that review is needed
>    - `reason`: Why a suspended or cancelled task stopped. Older lines may still use `blocked` or `suspended`.
> 4. A short description of what the task is.
>    For `Tnnnn`-style tasks, more details will be available in the corresponding task file in `.plan/tasks/Tnnnn-slug.md`

## Next Milestone
- [x] T0004 Replace the traffic-sign app icon and manifest branding with a weather icon.
- [ ] T0003 Publish the meteo repository on GitHub and serve it through GitHub Pages.
- [x] T0002 Add the twelve-hour temperature and hourly rain forecast view using Open-Meteo.
- [x] T0001 Bootstrap the meteo app shell from verkeersregels-quiz without the quiz-only features.

## Backlog
*(Currently no tasks)*
