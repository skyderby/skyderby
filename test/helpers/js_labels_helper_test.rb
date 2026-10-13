require 'test_helper'

class JsLabelsHelperTest < ActionView::TestCase
  test 'js_labels flattens nested translations into dotted keys' do
    labels = JSON.parse(js_labels(:units, :polar))

    assert_equal I18n.t('units.kmh'), labels['units.kmh']
    assert_equal I18n.t('charts.polar.axis.lift'), labels['charts.polar.axis.lift']
    assert_not labels.key?('charts.polar')
  end

  test 'js_labels uses the current locale' do
    labels = I18n.with_locale(:ru) { JSON.parse(js_labels(:units)) }

    assert_equal I18n.t('units.m', locale: :ru), labels['units.m']
  end

  test 'every label set resolves to existing translations' do
    labels = JSON.parse(js_labels(*JsLabelsHelper::JS_LABEL_SETS.keys))

    assert_empty(labels.values.grep(/translation missing/i))
  end
end
