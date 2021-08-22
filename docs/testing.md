# Testing

Back to [README](../README.md)

## Contents

- [Code Validation](#code-validation)
- [User Story Testing](#user-story-testing)

## Code Validation

**HTML**

Due to the way Svelte components are composed, HTML markup in .svelte files could not be validated as Svelte allows for use of Javascript variables and logic blocks directly in the markup and attempting to validate HTML through the [W3C Markup Validator](https://validator.w3.org/) will throw errors.

Example: Accordion.svelte

```
<div
  class="accordion"
  class:active={showDropdown} // class directive
  on:click={toggleDropdown} // on directive
  on:keypress={toggleDropdown}
  tabindex="0"
>
  <h3>{question}</h3> // reference javascript variable
</div>
{#if showDropdown || showAll} // if logic block
  <div class="panel">
    {@html answer}
  </div>
{/if}
```

Validating this markup will throw errors such as `Attribute on:click is not serializable as XML 1.0` and for this reason the HTML was not validated.

**CSS**

All CSS styles was validated with the [W3C CSS Validator](https://jigsaw.w3.org/css-validator/) and all changes were made in [5bb8f01](https://github.com/arlandfran/anime-corner-rankings/commit/5bb8f019cbc817949c61a1a5dd1dae6fc32a6c33). Every component passed with valid css however when validating by URI, errors are thrown due to the way Svelte compiles the bundle.css file. These are only shown when validating by URI and not by direct input.

**JS**

All Javascript code was validated by [JSHint](https://jshint.com/) and changes can be found on [9f4e2f7](https://github.com/arlandfran/anime-corner-rankings/commit/9f4e2f7a7c175ecd61ad5309a368b6a2006c6344). Because Svelte was used, JSHint throws unused variable errors as it doest not recognise the function is called in the markup - example: Accordion.svelte

```
JSHint: One unused variable toggleDropdown
------------------------------------------
function toggleDropdown() {
    if (showAll) {
      showAll = false;
      showDropdown = false;
    } else {
      showDropdown = !showDropdown;
    }
  }
```

But because Svelte has an `on:` directive, I can reference the function in my markup:

```
<div
  class="accordion"
  class:active={showDropdown}
  on:click={toggleDropdown} // <- used here
  on:keypress={toggleDropdown} // <- used here
  tabindex="0"
>
  <h3>{question}</h3>
</div>
{#if showDropdown || showAll}
  <div class="panel">
    {@html answer}
  </div>
{/if}
```

All remaining Svelte errors and warnings were as follows:

- The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype.
  Example:

  ```
  for (const anime in data.rankings) {
    // do something
  }
  ```

  This was left as is because we know that each object in the data array has a property and it keeps the code more readable.

- Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (console, banner, fetchKitsuBanners, title) - The code is commented so semantics should be clear.

## User Story Testing

1. As a user I want to be able to see the weekly anime ranking so I can see what is currently popular.

    1. Uses can navigate to the site and see the top 15 anime of the current week.

2. As a user I want to be able to select and view each anime so that I can find out more information about it.

    1. Users can click on a ranking and it expands a dropdown containing a description of the anime and what categories the anime is classed in.

3. As a user I want to be able to see what anime streaming platform each anime is available on so that I can watch the anime for myself if I am interested.

    1. Users can expand a ranking dropdown and see if the anime is streamed on either Crunchyroll or Funimation.
    2. Users can click on a streamer logo and the anime page on the streamer site will open in a new tab.
    3. If the show is not found on any streamer site then appropriate messaging is shown.

4. As a user I want to be able to see what was popular last week or further back so that I can track popularity trends or discover new anime.

    1. Users can use the arrow buttons and select dropdowns to go back and forth through past rankings.
    2. Users can see a rankings past standing on the ranking card to track popularity.
    3. Users can navigate using the keyboard for easier browsing of past rankings.

5. As a user I want to be able to vote for the current week's top anime so that I can contribute to the rankings.

    1. A link is provided at the footer of the site directing users where to vote. 
    2. A link is also provided in the About modal as frequently asked question.
