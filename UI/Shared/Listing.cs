namespace SynthSearcherUI.Shared
{
    public class Listing
    {
        public string? _id { get; set; }
        public string? uid { get; set; }
        public bool? InStock { get; set; }
        public int? __v { get; set; }
        public string? currency { get; set; }
        public DateTime? date_posted { get; set; }
        public DateTime? date_recorded { get; set; }
        public string? description { get; set; }
        public List<int>? location { get; set; }
        public Decimal? price {get;set;}
        public object? shipping { get; set; }
        public string? site { get; set; }
        public List<string>? tags { get; set; }
        public string? title { get; set; }
        public string? url { get; set; }

        public string FormattedPrice
        {
            get
            {
                return price == null ? "No Price" : string.Format("{0:C}", price.Value);
            }
        }

        public string FormattedTitle
        {
            get
            {
                if (title?.Length > 63)
                {
                    return title.Substring(0, 60) + "...";
                }
                else
                {
                    return string.IsNullOrEmpty(title) ? "No Link" : title;
                }
            }
        }


        public string FormattedLink
        {
            get
            {
                if(url?.Length > 53)
                {
                    return url.Substring(0, 25) + "...";
                }
                else
                {
                    return string.IsNullOrEmpty(url) ? "No Link" : url;
                }
            }
        }

        public string FormattedRecordedDate
        {
            get
            {
                return date_recorded?.ToString("MM/dd/yyyy") ?? "";
            }
        }

    }
}
