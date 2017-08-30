
/* eslint-disable angular/file-name */

'use strict';

angular.module('test', [
  'schemaForm', 'angularSchemaFormPreviewer'
]).value('settings', {
  model: {}
}).controller('FormController', [
  '$scope', 'settings', function ($scope, settings) {
    angular.extend($scope, settings);
  }
]);

function bootstrapTest(options) {
  options = options || {};

  function plainPreviewer(newValues) { return newValues[0]; }

  var schema = options.schema || { type: 'string' };
  var form = angular.extend({
    key: 'text', schema: schema, previewer: options.previewer || plainPreviewer
  }, options.form);
  var model = options.model;

  module(function ($provide) {
    if (options.previewers) $provide.value('asfPreviewer', options.previewers);

    $provide.decorator('settings', ['$delegate', function (settings) {
      settings.schema = { type: 'object', properties: { text: schema } };
      settings.form = [form];
      settings.model = model ? { text: model } : {};
      return settings;
    }]);
  });

  inject(function ($compile, $document, $rootScope) {
    var app = $compile(
      '<div ng-controller="FormController">' +
        '<form sf-form="form" sf-model="model" sf-schema="schema"></form>' +
      '</div>'
    )($rootScope);
    angular.bootstrap(app[0], [
      'schemaForm', 'angularSchemaFormPreviewer', 'test'
    ]);
    angular.element($document[0].body).append(app);
    var form = angular.element(app[0].querySelector('form[sf-form="form"]'));
    var field = angular.element(form[0].querySelector('[sf-field]'));
    if (!field || !field[0]) {
      if (options.fn) options.fn(app, form, field);
      return;
    }

    var input = angular.element(field[0].querySelector('.form-control'));
    var previewer = angular.element(field[0].querySelector('[asf-previewer]'));
    var scope = input.scope();
    options.fn(app, form, field, input, previewer, scope);
  });
}

describe('previewer add-on', function () {
  beforeEach(module('schemaForm'));
  beforeEach(module('angularSchemaFormPreviewer'));
  beforeEach(module('test'));

  it('supports `form.onChange`', function () {
    bootstrapTest({ form: {
      onChange: 'changed()'
    }, fn: function (app, form, field, input) {
      var spy = app.scope().changed = jasmine.createSpy('changed');
      input.controller('ngModel').$setViewValue('hello');
      expect(spy).toHaveBeenCalled();
    } });
  });

  it('rejects invalid values', function () {
    bootstrapTest({ fn: function (app, form, field, input, previewer, scope) {
      var ngModel = input.controller('ngModel');
      ngModel.$setViewValue([]);
      scope.$digest();
      expect(ngModel.$valid).toBe(false);
    } });
  });

  it('supports `form.ngModelOptions`', function () {
    bootstrapTest({ form: {
      ngModelOptions: { allowInvalid: true, debounce: 123, updateOn: 'blur' }
    }, fn: function (app, form, field, input, previewer, scope) {
      var ngModel = input.controller('ngModel');
      var options = input.controller('ngModelOptions').$options;
      expect(options.getOption('debounce')).toBe(123);
      expect(options.getOption('updateOn')).toBe('blur');
      ngModel.$setViewValue([]);
      scope.$digest();
      expect(ngModel.$valid).toBe(true);
    } });
  });

  it('supports `form.copyValueTo`', function () {
    bootstrapTest({ form: {
      copyValueTo: ['copy']
    }, fn: function (app, form, field, input, previewer, scope) {
      expect(scope.model.copy).toBeUndefined();
      input.controller('ngModel').$setViewValue('some text');
      expect(scope.model.copy).toEqual('some text');
    } });
  });

  it('uses `form.previewerHtmlClass`', function () {
    bootstrapTest({ form: {
      previewerHtmlClass: 'extra classes'
    }, fn: function (app, form, field, input, previewer) {
      expect(previewer.hasClass('extra')).toBe(true);
      expect(previewer.hasClass('classes')).toBe(true);
    } });
  });

  it('does nothing if `form.previewer` is undefined', function () {
    bootstrapTest({ form: {
      previewer: undefined
    }, fn: function (app, form, field, input, previewer) {
      expect(previewer[0]).toBeUndefined();
    } });
  });

  it('adds previewer if form type is \'text\'', function () {
    bootstrapTest({ fn: function (app, form, field, input, previewer) {
      expect(previewer[0]).toBeDefined();
    } });
  });

  it('adds previewer if form type is \'textarea\'', function () {
    bootstrapTest({ form: {
      type: 'textarea'
    }, fn: function (app, form, field, input, previewer) {
      expect(previewer[0]).toBeDefined();
    } });
  });

  it('does not add previewer if form type is \'password\'', function () {
    bootstrapTest({ form: {
      type: 'password'
    }, fn: function (app, form, field, input, previewer) {
      expect(previewer[0]).toBeUndefined();
    } });
  });

  it('hides previewer when `scope.preview == undefined`', function () {
    bootstrapTest({ previewer: function (newValues) {
      return newValues[0] || undefined;
    }, fn: function (app, form, field, input, previewer, scope) {
      var ngModel = input.controller('ngModel');
      expect(previewer.hasClass('ng-hide')).toBe(true);
      ngModel.$setViewValue('some text');
      scope.$digest();
      expect(previewer.hasClass('ng-hide')).toBe(false);
      ngModel.$setViewValue('');
      scope.$digest();
      expect(previewer.hasClass('ng-hide')).toBe(true);
    } });
  });

  it('binds HTML preview if form type is \'text\'', function () {
    bootstrapTest({ previewer: function (newValues) {
      var value = newValues[0];
      if (value == undefined) return;
      return '<p>test</p><p><b>' + value + '</b></p>';
    }, form: {
      type:'text'
    }, fn: function (app, form, field, input, previewer, scope) {
      var ngModel = input.controller('ngModel');
      ngModel.$setViewValue('some text');
      scope.$digest();
      var children = previewer.children();
      expect(children.length).toBe(2);
      expect(angular.element(children[0]).html()).toBe('test');
      expect(angular.element(children[1]).html()).toBe('<b>some text</b>');
    } });
  });

  it('binds HTML preview if form type is \'textarea\'', function () {
    bootstrapTest({ previewer: function (newValues) {
      var value = newValues[0];
      if (value == undefined) return;
      return '<p>test</p><p><b>' + value + '</b></p>';
    }, form: {
      type:'textarea'
    }, fn: function (app, form, field, input, previewer, scope) {
      var ngModel = input.controller('ngModel');
      ngModel.$setViewValue('some text');
      scope.$digest();
      var children = previewer.children();
      expect(children.length).toBe(2);
      expect(angular.element(children[0]).html()).toBe('test');
      expect(angular.element(children[1]).html()).toBe('<b>some text</b>');
    } });
  });
});
