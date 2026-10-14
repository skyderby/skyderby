class VirtualCompetition::Standing
  Entry = Data.define(:discipline, :result, :best) do
    def gap = result && best ? result - best : nil

    def best? = result.present? && result == best

    def points
      return 0.0 if result.to_f.zero? || best.to_f.zero?

      discipline.results_sort_order == 'ascending' ? best / result * 100 : result / best * 100
    end
  end
end
