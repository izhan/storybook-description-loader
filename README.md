# Storybook Description Loader

Add JSDoc comments to your storybook examples that show up on your DocsPage.

# Usage

**Code**
```jsx
// A `primary` button is used for emphasis.
export const Primary = () => <Button primary>Submit</Button>

/**
 * Use the `loading` prop to indicate progress. Typically use
 * this to provide feedback when triggering asynchronous actions.
 */
export const Loading = () => <Button loading>Loading</Button>
```

**Rendered docs**

![](https://cl.ly/ec53a39ae2c9/Image%2525202020-03-02%252520at%25252010.50.55%252520PM.png)


# Installation

**1. Installing package**

You'll need to have [Storybook](https://github.com/storybookjs/storybook) and the [Docs Addon](https://github.com/storybookjs/storybook/tree/master/addons/docs) installed. Then run:

`npm install --save-dev story-description-loader`

**2. Adding to Webpack**

*If using JSX*
```
module: {
  rules: [
    {
      test: /\.stories\.jsx/,
      use: [{ loader: "story-description-loader", options: { isJSX: true } }],
    }
  ]
}
```

*If using TSX*
```
module: {
  rules: [
    {
      test: /\.stories\.tsx/,
      use: [{ loader: "story-description-loader", options: { isTSX: true } }],
    }
  ]
}
```

*Or plain old JS*

```
module: {
  rules: [
    {
      test: /\.stories\.tsx/,
      use: [{ loader: "story-description-loader" }],
    }
  ]
}
```
