# Workout-Tracker

This is a lightweight, no fluff workout tracking application built in React Native to be compiled netively to mobile. This app is not meant to help you build a workout, help you with form, or give you a database of exercises; it assumes that you already know what you're doing, have a plan, and want a simple and hyper customizable tracker that can fit your specific needs. 

## Features

### Program Building

**Programs:** The app allows you to build programs (one or multiple, depending on how you work). These are containers for your specific workouts. 

**Mesocycles:** Each Program can be split into optional mesocycles, if you use them. Setting up mesocycles will allow you to set up how many times you'd like to cycle through your program before hitting your deload split (week, days, or anything that is user-set) 

**Days:** In the Program (or mesocycle) allows a collection of "Days". These days are not tied to any calendar or days of the week. Because of the very diverse syles of working out, not every program fits neatly into a calendar. For that reason, Days are tracked in simple sequence, it's up to the user to either set up rest days in their cycles, or just remember which days they need to go to the gym. The app will track your last completed day to help keep track what your next workout is. 

**Workouts:** Each day can have a series of Workouts. While its most common to workout once in a day, the app does allow those more committed to set up multiple workouts in one day. 

**Exercises:** Each workout has a series of Exercises. These exercises are not defined in a database (potentially something to improve in the future?) as there are thousands of obscure or personal variants that may not fit neatly into standard databases. For that reason, the app lets you define your own exercises. There's no hand holding here, *you* get to define what you want to do, and how you create that. 

That being said, you can easily start to build a "local" database of exercises. Once you've created an exercise once, the app will remember the details and let you pick it again from your personal list. 

**Set:** Each exercise can have a series of Sets. However, sets are _weird_. There are myo match, cluster, drop, fail, partial, time-based, supersets, etc. The app intends to allow you to do what you do best in the most painless way possible. This means defining a preset set type, or even defining your own - however, defining your own types will make it so that the data and reporting features work less well.

**Reps:** Obviously not all set types have reps, but those that do can define them here. Reps can be target ranges, or specific amounds, as well as undefined targets (like AMRAP for example)

### Data & Reporting 

**Exercise Stats & Trends:** The app keeps track of all your exercises and your best targets. The app will calculate 1RM and 10RM trends for exercises that are rep-based. For all other rep/set types, the app will trend your historic best targets and averages. 

**Program Stats:** The app keeps track of your program statistics, letting you know when you've hit goals, completed new personal bests, and otherwise showcasing your trends during the program. 

## Data Schema Definitions

**Program:**
- Each Program can have zero to many Mesocycles 
- Each Program can have one to many Workouts (if no Mesocycles are present)
- Each Program must have a name
- Each Program can have an optional color
- Each Program can have an optional description

**Mesocycle:**
- *Note: Mesocycles are optional*
- Each Mesocycle can have a set of "Cycles" to hold sets of Days
    - *Note: This is because we can't define a "standard" mesocycle, since that doesn't exist. By allowing users to self-define what their cycles look like, we don't have to create a rigid structure beforehand*
- Each Cycle will define a repetition frame (i.e. "8 Cycles")
    - *Note: This allows users to define a cycle for their working days/weeks, and a cycle for a deload day/week/weeks/months/etc. This is all user-defined*

**Day:**
- Each Day must have a name (e.g. "Chest Day")
- Each Day can have an optional color
- Each Day can have an optional description
- *Note: Days are effectively just containers for Workouts since a day can technically have multiple workouts, however most of the time, if only one workout exists, then a day acts as the defacto "Workout"*

**Workout:**
- *Note: By default, only one workout exists per day, which makes days and workouts analogous, however a day can handle multiple workouts if need be*
- Each additional Workout must have a name 
    *Note: If only one workout exists in a day, it doesn't show up in the UI, and inherits the Day name*

**Exercise:**
- *Note: Exercises should be saved to a local database/store of exercises. Instead of trying to catalogue all variants of all exercises that exist; we trust that the users know what they want to accomplish and let them create the exercises they need rather than give them a pre-populated database of thousands of exercises and variants they may never use. "ExerciseDefinition" is a very similar though separate object to "Exercise". ExerciseDefinition defines the reusable db object, while the Exercise object defines the trackable Exercise in a workout*
- Each Exercise must have a name (When inputting the name, existing exercises \[ExerciseDefinition] that match the name should be suggested)
- Each Exercise may have a description
- Each Exercise may be defined as a "Superset", which allows two different exericses to combine into one effective Exercise.
- Each Exercise must define a Completed boolean

**ExerciseDefinition**
- *Note: Different to the "Exercise" object above, ExerciseDefinitions define general exercises that a user can store locally and pick from, while the Exercise object defines the individual trackable exercises*
- Each ExerciseDefinition must have a name
- Each ExerciseDefinition may have a descriptions
- Each ExerciseDefinition may have a definition of "Affected Muscles"
    - *Note: Affected muscles can be set to "primary", "secondary", or "tertiary", which counts "sets worked" differently - primary muscles count as one set per set worked, secondary muscles count as a half set worked per set worked, and tertiary muscles count as a quarter set worked per set worked.*

**Set**
- *Note: Sets are _weird_. There are myo match, cluster, drop, fail, partial, time-based, supersets, AMRAP, etc. Some Sets may have "custom" types that are user-defined. Adding new sets, by default, mimics the last added set to make general additions easier, though new sets can be customized (rep ranges, types, etc.)*
- Each Set must have a SetType which defaults to the "Repetitions" type.
- Each Set may have a note defiend upon tracking 
    - *Note: This is for things like identifying personal reminders and notes, like what grips work or have been experimented with, what the user did different to the last time this set was recorded, and other personal notes that are worth keeping track of.*

**Reps**
- *Note: Not all sets have reps, some sets can be time-based, or use different measurement types*
- Each Rep can have a numeric target or range.