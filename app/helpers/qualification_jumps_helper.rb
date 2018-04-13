module QualificationJumpsHelper
  def qualification_jump_presentation(qualification_jump)
    "#{t('activerecord.models.event_track')}: " \
      "#{qualification_jump.competitor_name} | " \
      "Qualification - #{qualification_jump.round_order}"
  end
end
