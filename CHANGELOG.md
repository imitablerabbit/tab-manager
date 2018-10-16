# Changelog

## Version History

### 2.0.0

- Add ability to open a new blank tab. Just click the 'Go!' button or press enter on the new tab url box to create the new tab.
- Add ability to hide the filtering input box.
- Add ability to filter the open tabs according to a regex patten.
- Add ability to edit a tab url without the tab manager window closing.
- Add ability to change the number of characters that are displayed in the open tab titles.
- Add config initialisation on install and update.
- Add changelog to repo.
- Move to semantic versioning - This requires the jump to 2.0.0
- Code cleanup.
    - Reorganise the main `manager.js` functions.
    - Create the dom elements by functions rather than literal HTML.
    - Single place for config initialisation.