'use strict';

describe('asfPreviewer directive', function () {
  beforeEach(module('schemaForm'));
  beforeEach(module(function ($sceProvider) { $sceProvider.enabled(false); }));
  beforeEach(module('angularSchemaFormPreviewer'));

  function tryPreviewer(options) {
    options = options || {};
    if (options.previewers) module(function($provide) {
      $provide.value('asfPreviewer', options.previewers);
    });
    var schema = options.schema || { type: 'string' };
    var form = angular.extend({
      key: 'text', schema: schema, previewer: options.previewer || 'testing'
    }, options.form);
    var model = options.model || {};
    inject(function ($compile, $rootScope) {
      angular.extend($rootScope, {
        form: form, model: model, schema: schema
      }, options.scope);
      var element = $compile(
        '<div asf-previewer schema-validate="form" ng-model="model"></div>'
      )($rootScope);
      options.fn(element, element.scope(), element.controller('ngModel'));
    });
  }

  it('uses function-valued `form.previewer`', function () {
    var previewer = jasmine.createSpy('previewer');
    tryPreviewer({ previewer: previewer, fn: function (element, scope) {
      expect(previewer).not.toHaveBeenCalled();
      scope.model = 'text';
      scope.$digest();
      expect(previewer).toHaveBeenCalled();
    } });
  });

  it('uses string-valued `form.previewer`', function () {
    var previewer = jasmine.createSpy('previewer');
    tryPreviewer({ previewers: {
      testing: previewer
    }, fn: function (element, scope) {
      expect(previewer).not.toHaveBeenCalled();
      scope.model = 'text';
      scope.$digest();
      expect(previewer).toHaveBeenCalled();
    } });
  });

  it('skips if `form.previewer` is undefined', function () {
    tryPreviewer({
      fn: function (element, scope) {
        scope.model = 'text';
        scope.$digest();
        expect(scope.preview).toBe(undefined);
      }
    })
  });

  it('updates `scope.preview`', function () {
    var previewer = function (newValues) { return newValues[0] + ''; };
    tryPreviewer({ form: {
      previewer: previewer
    }, fn: function (element, scope) {
      expect(scope.preview).toBe(undefined);
      scope.model = 24;
      scope.$digest();
      expect(scope.preview).toBe('24');
      scope.model = undefined;
      scope.$digest();
      expect(scope.preview).toBe('undefined');
    } });
  });

  it('uses string-valued `form.previewerWatch`', function () {
    var previewer = jasmine.createSpy('previewer');
    tryPreviewer({ form: {
      previewer: previewer, previewerWatch: 'hello'
    }, fn: function (element, scope) {
      expect(previewer).not.toHaveBeenCalled();
      scope.hello = 'world';
      scope.$digest();
      expect(previewer).toHaveBeenCalled();
    } });
  });

  it('uses array-valued `form.previewerWatch`', function () {
    var previewer = jasmine.createSpy('previewer');
    tryPreviewer({ form: {
      previewer: previewer, previewerWatch: ['hello', 'see']
    }, fn: function (element, scope) {
      expect(previewer).not.toHaveBeenCalled();
      scope.see = 'you';
      scope.$digest();
      expect(previewer).toHaveBeenCalled();
    } });
  });

  it('passes `newValues`, `oldValues`, `scope`, `watched` to previewer',
  function () {
    var saved = [];
    var previewer = jasmine.createSpy('previewer').and.callFake(
      function (newValues, oldValues, scope, watched) {
        saved.push([
          angular.copy(newValues), angular.copy(oldValues), scope,
          angular.copy(watched)
        ]);
      }
    );
    tryPreviewer({ form: {
      previewer: previewer, previewerWatch: ['hello', 'see']
    }, fn: function (element, scope) {
      expect(previewer).not.toHaveBeenCalled();
      scope.model = 'view';
      scope.$digest();
      scope.hello = 'world';
      scope.$digest();
      scope.see = 'you';
      scope.$digest();
      expect(previewer).toHaveBeenCalledTimes(3);
      expect(saved[0][0]).toEqual(['view', undefined, undefined]);
      expect(saved[1][0]).toEqual(['view', 'world', undefined]);
      expect(saved[2][0]).toEqual(['view', 'world', 'you']);
      // does not test whether oldValues has correct value
      for (var i = 0; i < 3; i++) {
        expect(saved[i][2]).toBe(scope);
        expect(saved[i][3]).toEqual(['model', 'hello', 'see']);
      }
    } });
  });
});
