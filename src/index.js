/**
 * Docgen for each story. Automatically adds docs-addon description to stories
 * that have a comment. See https://github.com/storybookjs/storybook/issues/8527
 * for tracking upstream issue.
 *
 * Usage:
 *
 *    // This is a description of the story below that will
 *    // ultimately be rendered in Storybook
 *    export const Default = () => <MyComponent />
 *
 */

const babel = require("@babel/core")

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
    const output = babel.transformSync(source, {
        plugins: [["@babel/plugin-transform-typescript", { isTSX: true }], annotateDescriptionPlugin],
        sourceType: "module",
    })
    return output.code
}
