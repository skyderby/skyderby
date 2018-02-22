module TracksHelper
  def title(track)
    "#{t('tracks.show.title_track')} ##{track.id} | #{track_pilot_name(track)}"
  end

  def subheader(track)
    "#{t 'tracks.show.title_suit'}: #{track.suit ? track.suit_name : track.missing_suit_name}, @#{track.location}"
  end

  def track_pilot_name(track)
    track.pilot ? track.pilot.name : track.name
  end

  def track_pilot_country_code(track)
    track.pilot ? track.pilot.country_code : ''
  end

  def track_place(track)
    track.place ? place_presentation(track.place) : track.location
  end

  def track_place_name(track)
    track.place ? track.place_name : track.location
  end

  def track_place_country_code(track)
    track.place&.country_code
  end

  def tracks_index
    render template: 'tracks/_index.json.jbuilder',
           formats: :json
  end

  def range_title(result)
    '' + result.range_from.to_s + ' - ' + result.range_to.to_s if result
  end

  def track_icons(track)
    capture do
      concat content_tag(:i, nil, class: 'fa fa-fw fa-video-camera') if track.video

      concat content_tag(:i, nil,
                         class: 'fa fa-fw fa-eye-slash',
                         'data-toggle' => 'tooltip',
                         title: t('visibility.unlisted')) if track.unlisted_track?

      concat content_tag(:i, nil,
                         class: 'fa fa-fw fa-lock',
                         'data-toggle' => 'tooltip',
                         title: t('visibility.private')) if track.private_track?
    end
  end

  def tracks_sort_header(order_field, order_direction, field, field_presentation)
    if order_field == field.upcase && order_direction == 'DESC'
      content_tag(:a, nil,
                  href: tracks_path(index_params.merge(order: "#{field} ASC")),
                  'data-remote' => true,
                  'data-toggle' => 'tooltip',
                  title: "Sort by #{field_presentation} ascending",
                  rel: 'nofollow') do
        content_tag(:i, nil, class: 'fa fa-sort-amount-desc')
      end
    elsif order_field == field.upcase && order_direction == 'ASC'
      content_tag(:a, nil,
                  href: tracks_path(index_params.merge(order: "#{field} DESC")),
                  'data-remote' => true,
                  'data-toggle' => 'tooltip',
                  title: "Sort by #{field_presentation} descending",
                  rel: 'nofollow') do
        content_tag(:i, nil, class: 'fa fa-sort-amount-asc')
      end
    else
      content_tag(:a, nil,
                  class: 'text-muted',
                  href: tracks_path(index_params.merge(order: "#{field} DESC")),
                  'data-remote' => true,
                  'data-toggle' => 'tooltip',
                  title: "Sort by #{field_presentation} descending",
                  rel: 'nofollow') do
        content_tag(:i, nil, class: 'fa fa-sort-amount-desc')
      end
    end
  end
end
