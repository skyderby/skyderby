require 'test_helper'

class TitleizeTest < ActiveSupport::TestCase
  test 'keeps correctly cased cyrillic names untouched' do
    assert_equal 'Пупкин Василий', 'Пупкин Василий'.titleize
  end

  test 'capitalizes lower case cyrillic names' do
    assert_equal 'Пупкин Василий', 'пупкин василий'.titleize
  end

  test 'downcases the tail of upper case cyrillic names' do
    assert_equal 'Пупкин Василий', 'ПУПКИН ВАСИЛИЙ'.titleize
  end

  test 'titleizes latin names' do
    assert_equal 'John Doe', 'John Doe'.titleize
    assert_equal 'Jane Doe', 'jane doe'.titleize
  end

  test 'collapses and trims whitespace' do
    assert_equal 'Пупкин Василий', '  пупкин   василий '.titleize
  end

  test 'handles blank and single word strings' do
    assert_equal '', ''.titleize
    assert_equal 'Василий', 'василий'.titleize
  end

  test 'accepts the keep_id_suffix keyword for signature compatibility' do
    assert_equal 'Василий', 'василий'.titleize(keep_id_suffix: true)
  end
end
