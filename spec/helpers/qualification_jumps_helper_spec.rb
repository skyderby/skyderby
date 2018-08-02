describe QualificationJumpsHelper do
  it '#qualification_jump_presentation' do
    jump = qualification_jumps(:qualification_jump_1)
    expect(helper.qualification_jump_presentation(jump)).to eq(
      'Result: John | Qualification - 1'
    )
  end
end
