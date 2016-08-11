module TracksHelper
  def title(track)
    "#{t 'tracks.show.title_track' } ##{track.id} | #{track_pilot(track)}"
  end

  def header(track)
    " | #{t 'tracks.show.title_track'} ##{track.id}"
  end

  def subheader(track)
    "#{t 'tracks.show.title_suit'}: #{track.wingsuit.present? ? track.wingsuit.name : track.suit}, @#{track.location}"
  end

  def track_pilot(track)
    track.pilot ? track.pilot.name : track.name
  end

  def track_place(track)
    track.place ? place_presentation(track.place) : track.location
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
                         title: t('tracks.edit.unlisted')) if track.unlisted_track?

      concat content_tag(:i, nil,
                         class: 'fa fa-fw fa-lock',
                         'data-toggle' => 'tooltip',
                         title: t('tracks.edit.private')) if track.private_track?
    end
  end

  def tracks_sort_header(order_field, order_direction, field, field_presentation)
    action_params = params.except(:action, :controller, :locale)
    if order_field == field.upcase && order_direction == 'DESC'
      content_tag(:a, nil,
                  href: tracks_path(action_params.merge(order: "#{field} ASC")),
                  'data-toggle' => 'tooltip',
                  title: "Sort by #{field_presentation} ascending",
                  rel: 'nofollow') do
        content_tag(:i, nil, class: 'fa fa-sort-amount-desc')
      end
    elsif order_field == field.upcase && order_direction == 'ASC'
      content_tag(:a, nil,
                  href: tracks_path(action_params.merge(order: "#{field} DESC")),
                  'data-toggle' => 'tooltip',
                  title: "Sort by #{field_presentation} descending",
                  rel: 'nofollow') do
        content_tag(:i, nil, class: 'fa fa-sort-amount-asc')
      end
    else
      content_tag(:a, nil,
                  class: 'text-muted',
                  href: tracks_path(action_params.merge(order: "#{field} DESC")),
                  'data-toggle' => 'tooltip',
                  title: "Sort by #{field_presentation} descending",
                  rel: 'nofollow') do
        content_tag(:i, nil, class: 'fa fa-sort-amount-desc')
      end
    end
  end
end
