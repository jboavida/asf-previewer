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

/**
 * @see {@link https://github.com/jboavida/asf-previewer}
 * @copyright João Pedro Boavida 2017
 * @license MIT
 */

'use strict';

angular.module('angularSchemaFormPreviewer').value('asfPreviewer', {});

angular.module('angularSchemaFormPreviewer').directive('asfPreviewer', [
  'asfPreviewer', function (previewers) {
    return {
      scope: true,
      link: function (scope, element, attrs) {
        var previewer = scope.form.previewer;
        if (!angular.isFunction(previewer)) {
          previewer = previewers[scope.form.previewer];
        }
        if (!previewer) return;
        var watched = [attrs.ngModel];
        if (scope.form.previewerWatch) {
          watched = watched.concat(scope.form.previewerWatch);
        }
        scope.preview = undefined;
        scope.$watchGroup(watched, function (newValues, oldValues, scope) {
          scope.preview = previewer(newValues, oldValues, scope, watched);
        });
      }
    };
  }
]);
