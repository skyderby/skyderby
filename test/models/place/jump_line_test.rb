describe Place::JumpLine do
  it '#touched on add measurement' do
    jump_line = places(:hellesylt).jump_lines.create!(name: 'Steepest')
    updated_at = jump_line.updated_at

    jump_line.measurements.create!(altitude: 30, distance: 0)
    jump_line.reload

    expect(jump_line.updated_at).not_to eq(updated_at)
  end
end
