Angular Schema Form Previewer Add-on
====================================

Previewer add-on for [Angular Schema Form](https://github.com/json-schema-form/angular-schema-form). No batteries included: user provides previewer functions (e.g., for HTML, markdown, syntax highlighting, SVG, etc.).

The form option `previewer` (used with the Bootstrap Decorator and apply to fields with form type `"text"` or `"textarea"`) adds a preview panel next to the field.

(This is probably clear, but just in case: this is a package _for_ Angular, Bootstrap, and Angular Schema Form, but it is not affiliated with any of them.)


Contents
--------

- [Examples and description](#examples-and-description)
- [Installation and usage](#installation-and-usage)
- [Options and behavior](#options-and-behavior)
  - [Relevant schema options and field validity](#relevant-schema-options-and-field-validity)
  - [Previewer](#previewer)
  - [Configuration](#configuration)
- [Future changes; semantic versioning](#future-changes-semantic-versioning)
- [Contributions](#contributions)
- [License](#license)


Examples and description
------------------------

Any forms with `type: 'text'` or `type: 'textarea'` are supported. The add-on is activated by setting `previewer` in the form definition, and adds a preview area after the input element.

For example, the schema
```json
{
  "type": "object",
  "properties": {
    "html": { "type": "string", "title": "HTML" }
  }
}
```
and form
```js
[{
  key: 'html',
  type: 'textarea',
  previewer: function (newValues) {
    return newValues[0]; // the new value of the field
  }
}]
```
specify a form with a text area followed by a preview displaying the input as HTML.

Without [further configuration](#previewer), the `previewer` function responds to changes to the value of the current field and `newValues[0]` (in the example above) is the new value of the field.

In this example,
```json
{
  "type": "object",
  "properties": {
    "html": { "type": "string", "title": "HTML" },
    "lang": { "type": "string", "title": "Language code" }
  }
}
```
```js
[
  'lang',
  {
    key: 'html',
    type: 'textarea',
    previewer: function (newValues) {
      return '<div lang="' + newValues[1] + '">' + newValues[0] + '</div>';
    },
    previewerWatch: 'model.lang'
  }
]
```
in addition to the field value, `model.lang` is watched too, and so `newValues[0]` is the new field value, while `newValues[1]` is the new value of `model.lang`. The previewer function wraps the `html` field value in a div element with the language attribute specified by the `lang` field.

The `previewer` option can also be set to the name of a [predefined previewer](#configuration).

The original use case was markdown preview, with different configurations (what markdown possibilities are turned on) in different fields. But it can be used for whatever preview the user defines.


Installation and usage
----------------------

As other ASF add-ons do, this one manages its dependencies via [Bower](https://bower.io/). [Angular](https://angularjs.org/) (1.6), [Angular Schema Form](https://github.com/json-schema-form/angular-schema-form) and its Bootstrap Decorator, and their dependencies must all be available for this add-on to work. If they are already installed in typical locations,
```html
<script src="bower_components/angular/angular.min.js"></script>
<script src="bower_components/angular-sanitize/angular-sanitize.min.js"></script>
<script src="bower_components/tv4/tv4.js"></script>
<script src="bower_components/objectpath/lib/ObjectPath.js"></script>
<script src="bower_components/angular-schema-form/dist/schema-form.min.js"></script>
<script src="bower_components/angular-schema-form-bootstrap/bootstrap-decorator.min.js"></script>
<script src="bower_components/angular-schema-form-previewer/angular-schema-form-previewer.min.js"></script>
<link href="bower_components/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" />
```
inside `<head></head>` invokes all required files, and
```js
angular.module('app', ['schemaForm', 'angularSchemaFormPreviewer']);
```
creates an app including this add-on.

In a system with Bower already installed,
```
$ bower install angular-schema-form-previewer
```
installs all dependencies.

The add-on can be installed from [npm](https://www.npmjs.com/), with
```
$ npm install angular-schema-form-previewer
```
after which `bower install` installs (Bower) dependencies.

To work with the package as a stand-alone, clone the repository:
```
$ git clone https://github.com/jboavida/asf-previewer.git
```
creates a new directory `asf-previewer` and clones the repository into it. Within the new directory, `npm install` installs all development dependencies (including Bower), `npm test` runs all tests, and `npm start` generates the minified file and starts a demo server at `http://localhost:8080/` (using the files at [`./demo`](./demo)).


Options and behavior
--------------------

The [standard options](https://github.com/json-schema-form/angular-schema-form/blob/development/docs/index.md#standard-options) are supported directly by the Bootstrap Decorator of Angular Schema Form, but they apply to the primary field (of type `'text'` or `'textarea'`).

The other form options (and their defaults) are:
```js
{
  previewer: undefined,     // what previewer to use
  previewerHtmlClass: '',   // additional classes for previewer
  previewerWatch: []        // additional expressions to watch
}
```


### Relevant schema options and field validity

Only schemas compatible with form types `'text'` or `'textarea'` are supported, and no validation results are changed by the add-on.


### Previewer

The previewer is selected using the `previewer` form option. Its value can be either a function or a string with the name of a [predefined previewer function](#configuration).

Previewer functions have signature `previewer(newValues, oldValues, scope, watched)` and responds to changes to a list of watched expressions. `newValues` is an array with the new values of the expressions, `oldValues` is an array with the previous values, `scope` is the scope of the directive, and `watched` is the array of watched expressions (scoped with respect to `scope`).

By default, only the array of watched expressions contains only the current field, and so `newValues[0]` is its new value, while `oldValues[0]` is the previous one. If the `previewerWatch` option is present, it is concatenated to the array of watched expressions. If Angular Schema Form expressions (such as `model[propertyName]` or `item[propertyName]`) are watched, it should be kept in mind that most expressions are not part of ASF's public API.

The value returned from the previewer function is displayed (as HTML) inside a `div` element, with class set by the `previewerHtmlClass` option. However, the `div` is hidden if the return value is `undefined`.

Appropriate sanitization should be applied to the value before returning it from the previewer function. By default, Angular uses the [`$sce` service](https://docs.angularjs.org/api/ng/service/$sce), which uses [`ngSanitize`](https://docs.angularjs.org/api/ngSanitize) (it is a dependency of Angular Schema Form and should be made available; there is an [example](#installation-and-usage) above). Check also the [security recommendations](https://docs.angularjs.org/guide/security) in Angular's developer guide.

The [`ngModelOptions` form option](https://github.com/json-schema-form/angular-schema-form/blob/development/docs/index.md#ngmodeloptions) (for this field or for other watched fields) can be used to configure `updateOn`, `debounce`, and [other `ngModelOptions` preferences](https://docs.angularjs.org/api/ng/directive/ngModelOptions).


### Configuration

Predefined names previewers are saved in the `asfPreviewer` value service. For example,
```js
angular.module('angularSchemaFormPreviewer').value('asfPreviewer', {
  html: function (newValues) { return newValues[0]; },
  htmlWithLang: function (newValues) {
    return '<div lang="' + newValues[1] + '">' + newValues[0] + '</div>';
  }
});
```
saves the previewers from the [earlier examples](#examples-and-description). Forms can now use `previewer: 'html'` or `previewer: 'htmlWithLang'` instead of providing the function directly.

To apply the change only to a specific app, we can simply do
```js
angular.module('app').value('asfPreviewer', {
  html: function (newValues) { return newValues[0]; },
  htmlWithLang: function (newValues) {
    return '<div lang="' + newValues[1] + '">' + newValues[0] + '</div>';
  }
});
```
(to ignore any previewers set directly on the module) or use a [decorator](https://docs.angularjs.org/guide/decorators) and make a shallow copy of the original value before modifying it

```js
angular.module('app').config(['$provide', function($provide) {
  $provide.decorator('asfPreviewer', ['$delegate', function (previewers) {
    previewers = angular.extend(angular.copy(previewers), {
      html: function (newValues) { return newValues[0]; },
      htmlWithLang: function (newValues) {
        return '<div lang="' + newValues[1] + '">' + newValues[0] + '</div>';
      }
    });
    return previewers; // don't forget this
  }]);
}]);
```
(to keep any previewers set directly on the module and add previewers that apply only to that app).


Future changes; semantic versioning
-----------------------------------

This package started as a submodule of another project. I factored it out as a stand-alone module and cleaned it up enough to make it easy to maintain, but I'm still adjusting it as needed for the other project.

I intend to follow semantic versioning. I don't expect to make big changes: the add-on has a quite restricted task, with few or no updates to make. Moreover, it does not make much sense to make big changes before the next version of Angular Schema Form is released. So, I'm very likely to make only changes that are clearly needed (or helpful) for the other project.


Contributions
-------------

Until I'm confident the package is sufficiently stable, I won't accept code contributions.

Issues (bug reports, suggestions, etc.) are welcome, but I may take some time to get to them.


License
-------

Copyright © 2017 João Pedro Boavida. Licensed under the [MIT License](LICENSE).
