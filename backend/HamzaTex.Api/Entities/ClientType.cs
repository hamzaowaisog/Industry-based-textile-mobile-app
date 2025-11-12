namespace HamzaTex.Api.Entities;

    public partial class ClientType
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }

        public DateTime? CreatedAt { get; set; }

        public virtual ICollection<Client> Clients { get; set; } = new List<Client>();
    }