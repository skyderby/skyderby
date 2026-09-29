json.period journal.period
json.periods journal.periods do |period|
  json.key period
  json.label t("journal.periods.#{period}")
end

json.tasks journal.tasks do |task|
  json.key task.key
  json.title t("journal.tasks.#{task.key}")
  json.higher_is_better task.higher_is_better
  json.unit journal_unit_label(task.unit)
  json.series task.series do |series|
    json.key series.key
    json.label journal_series_label(task, series.key)
    json.points series.points do |point|
      json.extract! point, :x, :y, :date, :track_id, :comment
      json.suit point.suit && [point.suit.manufacturer&.code, point.suit.name].compact_blank.join(' ')
      json.place point.place&.name
    end
  end
end
