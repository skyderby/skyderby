require 'test_helper'

class Place::JumpLineTest < ActiveSupport::TestCase
  test '#touched on add measurement' do
    jump_line = places(:hellesylt).jump_lines.create!(name: 'Steepest')
    updated_at = jump_line.updated_at

    jump_line.measurements.create!(altitude: 30, distance: 0)
    jump_line.reload

    assert_not_equal updated_at, jump_line.updated_at
  end
end
