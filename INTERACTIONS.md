This document aims to explain the way that a user is expected to interact with the application. 

## Home Screen (Current Program)
- The home screen should open to the last used Program (we can assume that the user wants to continue where they left off)
- Additionally, the user can set one program to be "default", which will open up by default
- Switching between programs requires going back to the Program Management tab/screen
- From this screen, users can see a list of Days they have set up, or they can set up new, or edit existing days. 
- The app also remembers the last completed day, so the user knows which day to start next. 

## Program Management Screen
- Users can open a different program, create new programs, or delete/edit programs from this screen
- In the Program setup, the user should be able to define a mesocycle (how many repetitions of the program is the user aiming to complete?)
    - *Note: In the future, we should consider letting users set up a "program" for the mesocycle, and a separate "program" for the deload, this will allow for better tracking and customization of deload times; this would also allow users to set up multiple programs/cycles in tandem; i.e. Program 1 is to be Cycled 8 times, then Program 2 could be the "deload" program, which is Cycled only once, then Program 3 is the next training phase, Cycled 4 times, then Program 4 is the same as the Program 2 deload. This would allow the user to cycle this master program ad infinitum while still getting some variance.*
    - *Note: What happens to tracking when the program changes slightly each mesocycle? Should we expect the user to create a whole new program, or do we keep records based on specific exercises? Something in between maybe?*

## Days/Workouts Screen
- The Days Screen is where users can set up their workouts. 
- By default, a Day is a single Workout in a 1:1 relationship, but users can set up multiple workouts in one day in the event that they have multiple workouts in a single day
    - *Note: Start with just the 1:1 feature for now, allowing for future expansion of one-to-many Days to Workours in the future?*
- If a mesocycle is set up, each day should show how many completed cycles the user has done.
- Clicking on a day card (or workout card if multiple workouts in a day) opens up the Workout view

### Workout Screen
- Users can edit/start a workout from here. 
- Starting a workout highlights the first exercise in the list, and its first set, allowing users to input their tracking data. 