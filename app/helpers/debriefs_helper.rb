module DebriefsHelper
  def debrief_title(debrief)
    return debrief_discipline_label(debrief.discipline) unless debrief.comparison?

    window = debrief.inputs['comparison']
    name = debrief.other_track&.pilot&.name || debrief.other_track&.name
    [t('tracks.debriefs.comparison_title', name:),
     t('tracks.debriefs.windows.range', from: window['from'], to: window['to'])].join(' · ')
  end

  def debrief_discipline_label(discipline)
    part = discipline.window_part
    return competition_badge(discipline) unless part&.chosen_window?

    window = t('tracks.debriefs.windows.range', from: part.window_from, to: part.window_to)
    "#{competition_badge(discipline)} · #{window}"
  end
end
