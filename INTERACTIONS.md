This document aims to explain the way that a user is expected to interact with the application. 

## Home Screen (Opened Current Program)
The Current Program Screen can be seen as the "Days" screen of the active program:
![Days Screen](src/images/wireframes/Days%20Screen.png)
- The home screen should open to the last used Program (we can assume that the user wants to continue where they left off)
- Additionally, the user can set one program to be "default", which will open up by default
- Switching between programs requires going back to the Program Management tab/screen
- From this screen, users can see a list of Days they have set up, or they can set up new, or edit existing days. 
- The app also remembers the last completed day, so the user knows which day to start next. 


## Program Management Screen
The Program Management Screen can be seen below:
![Programs Screen](src/images/wireframes/Programs%20Screen.png)
- Users can open a different program, create new programs, or delete/edit programs from this screen
- In the Program setup, the user should be able to define a mesocycle (how many repetitions of the program is the user aiming to complete?)
    - *Note: In the future, we should consider letting users set up a "program" for the mesocycle, and a separate "program" for the deload, this will allow for better tracking and customization of deload times; this would also allow users to set up multiple programs/cycles in tandem; i.e. Program 1 is to be Cycled 8 times, then Program 2 could be the "deload" program, which is Cycled only once, then Program 3 is the next training phase, Cycled 4 times, then Program 4 is the same as the Program 2 deload. This would allow the user to cycle this master program ad infinitum while still getting some variance.*
    - *Note: What happens to tracking when the program changes slightly each mesocycle? Should we expect the user to create a whole new program, or do we keep records based on specific exercises? Something in between maybe?*

## Days/Workouts Screen
The Days/Workouts Screen can be seen below:
![Days Screen](src/images/wireframes/Days%20Screen.png)
- The Days Screen is where users can set up their workouts. 
- By default, a Day is a single Workout in a 1:1 relationship, but users can set up multiple workouts in one day in the event that they have multiple workouts in a single day
    - *Note: Start with just the 1:1 feature for now, allowing for future expansion of one-to-many Days to Workours in the future?*
- If a mesocycle is set up, each day should show how many completed cycles the user has done.
- Clicking on a day card (or workout card if multiple workouts in a day) opens up the Workout view

### Workout Screen
The Workout Screen can be seen below:
![Workout Screen](src/images/wireframes/Workout%20Screen.png)
- Users can edit/start a workout from here. 
- Starting a workout highlights the first exercise in the list, and its first set, allowing users to input their tracking data. 

### Other Screens
Below are additional wireframe designs for other screens that will be required. This is not an exhaustive list yet.

#### Workout Screen (Superset & Compound Sets)
This showcases the wireframe for how supersets and compound sets should look. These two types of sets are very similar in that they're a collection of weight & rep pairs. Supersets combine two or more different exercises, while other compound sets are one exercise with multiple different types of sets (such as one straight set followed by two drop sets). 

![Workout Screen - Superset](src/images/wireframes/Workout%20Screen%20Superset.png)
![Workout Screen - Compound Set](src/images/wireframes/Workout%20Screen%20Compound%20Set.png)

#### Workout Screen (Notes)
This showcases what opening up the "Notes" panel should look like. Clicking on the chat bubble icon (notes) in an exercise should open up a dialog allowing the user to input a new note, and see a list of prior notes that exist for this set in this exercise. 

![Workout Screen - Notes](src/images/wireframes/Workout%20Screen%20Notes.png)

#### Workout Screen (History)
This is a showcase of what opening up the "History" panel should look like. Clicking on the chart icon in an exercise should open up a dialog allowing the user to scroll through past set completions. This will also allow users to quickly check the notes on a specific set by clicking the chat icon, which would open up a modal with the specific note

![Workout Screen - Past Sets](src/images/wireframes/Workout%20Screen%20History.png)
