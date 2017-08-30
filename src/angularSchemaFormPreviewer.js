/**
 * @see {@link https://github.com/jboavida/asf-previewer}
 * @copyright João Pedro Boavida 2017
 * @license MIT
 */

'use strict';

angular.module('angularSchemaFormPreviewer', ['schemaForm']).config([
  'schemaFormDecoratorsProvider', 'sfBuilderProvider',
  function (schemaFormDecoratorsProvider, sfBuilderProvider) {
    function previewerBuilder(args) {
      if (!args.form.previewer) return;
      angular.element(args.fieldFrag.firstChild).append(
        '<div asf-previewer class={{::form.previewerHtmlClass}} ' +
          'ng-bind-html="preview" ng-hide="preview == undefined" ' +
        'sf-field-model></div>'
      );
    }
    var builders = [previewerBuilder].concat(sfBuilderProvider.stdBuilders);

    schemaFormDecoratorsProvider.defineAddOn(
      'bootstrapDecorator', 'text', 'decorators/bootstrap/default.html',
      builders
    );
    schemaFormDecoratorsProvider.defineAddOn(
      'bootstrapDecorator', 'textarea', 'decorators/bootstrap/textarea.html',
      builders
    );
  }
]);
