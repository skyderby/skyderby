module DebriefsHelper
  def debrief_title(debrief)
    return debrief_discipline_label(debrief.discipline) unless debrief.comparison?

    settings = debrief.inputs['comparison']
    name = debrief.other_track&.pilot&.name || debrief.other_track&.name
    focus = if settings['focus'] == 'flare'
              t('tracks.debriefs.focus.flare')
            else
              t('tracks.debriefs.windows.range', from: settings['from'], to: settings['to'])
            end
    [t('tracks.debriefs.comparison_title', name:), focus].join(' · ')
  end

  def debrief_discipline_label(discipline)
    part = discipline.window_part
    return competition_badge(discipline) unless part&.chosen_window?

    window = t('tracks.debriefs.windows.range', from: part.window_from, to: part.window_to)
    "#{competition_badge(discipline)} · #{window}"
  end
end
