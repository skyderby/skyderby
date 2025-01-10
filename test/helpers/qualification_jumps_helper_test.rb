describe QualificationJumpsHelper do
  it '#qualification_jump_presentation' do
    jump = qualification_jumps(:qualification_jump_1)
    expect(helper.qualification_jump_presentation(jump)).to eq(
      "#{I18n.t('activerecord.models.event/result')}: John | Qualification - 1"
    )
  end
end
