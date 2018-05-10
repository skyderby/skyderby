module SponsorsHelper
  def new_sponsor_link(sponsorable)
    link_to(content_tag(:i, nil, class: 'fa fa-plus') + ' ' + t('sponsors.list.add_sponsor'),
            polymorphic_path([:new, sponsorable, :sponsor]),
            remote: true,
            class: 'add-sponsor button button--minimal')
  end

  def copy_sponsors_link(sponsorable)
    link_to(content_tag(:i, nil, class: 'fa fa-copy') + ' ' + t('sponsors.list.copy_sponsor'),
            polymorphic_path([:new, sponsorable, :sponsors_copy]),
            remote: true,
            class: 'button button--minimal')
  end
end
