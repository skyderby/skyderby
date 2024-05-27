require 'test_helper'

class QualificationJumpsHelperTest < ActionView::TestCase
  test '#qualification_jump_presentation' do
    jump = qualification_jumps(:qualification_jump_1)
    assert_equal(
      "#{I18n.t('activerecord.models.event/result')}: John | Qualification - 1",
      qualification_jump_presentation(jump)
    )
  end
end
