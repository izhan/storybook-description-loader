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

function createDescriptionNode(name, description) {
    return babel.types.expressionStatement(
        babel.types.assignmentExpression(
            "=",
            babel.types.memberExpression(babel.types.identifier(name), babel.types.identifier("story")),
            babel.types.objectExpression([
                babel.types.objectProperty(
                    babel.types.identifier("parameters"),
                    babel.types.objectExpression([
                        babel.types.objectProperty(
                            babel.types.identifier("docs"),
                            babel.types.objectExpression([
                                babel.types.objectProperty(
                                    babel.types.identifier("storyDescription"),
                                    babel.types.stringLiteral(description),
                                ),
                            ]),
                        ),
                    ]),
                ),
            ]),
        ),
    )
}

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

                    path.insertAfter(createDescriptionNode(declaration.id.name, description))
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
