/**
 * Docgen for each Storybook story. Automatically adds docs-addon description to stories
 * that have a comment. 
 * 
 * See https://github.com/storybookjs/storybook/issues/8527 for issue that inspired
 * this loader.
 *
 * Usage:
 *
 *    // This is a description of the story below that will
 *    // ultimately be rendered in Storybook
 *    export const Variation = () => <MyComponent />
 *
 */
const loaderUtils = require("loader-utils")
const babel = require("@babel/core")
const validateOptions = require("schema-utils");
const schema = require("./options.json")

function annotateDescriptionPlugin() {
    return {
        visitor: {
            ExportNamedDeclaration(path) {
                if (path.node.leadingComments) {
                    const commentValues = path.node.leadingComments.map((node) => {
                        if (node.type === "CommentLine") {
                            return node.value.trimLeft()
                        } else if (node.type === "CommentBlock") {
                            return node.value
                                .split("\n")
                                .map((line) => {
                                    // stripping out the whitespace and * from comment blocks
                                    return line.replace(/^(\s+)?(\*+)?(\s+)?/, "")
                                })
                                .join("\n")
                                .trim()
                        }
                    })
                    const description = commentValues.join("\n")
                    const declaration = path.node.declaration.declarations[0]
                    const storyId = declaration.id.name;

                    path.container.push(
                      ...babel.template.ast`
                        ${storyId}.parameters ??= {};
                        ${storyId}.parameters.docs ??= {};
                        ${storyId}.parameters.docs.description ??= {};
                        ${storyId}.parameters.docs.description.story ??= ${JSON.stringify(
                        description
                      )};
                        `
                    );
                }
            },
        },
    }
}

module.exports = function (source) {
    const options = loaderUtils.getOptions(this) || {};

    validateOptions(schema, options, {
      name: "Story Description Loader"
    });

    const isTSX = options.isTSX || false;
    const defaultPlugins = options.isTSX || options.isJSX ? [["@babel/plugin-transform-typescript", { isTSX }]] : []
    const output = babel.transformSync(source, {
      plugins: [...defaultPlugins, annotateDescriptionPlugin],
      sourceType: "module"
    });
    return output.code
}
