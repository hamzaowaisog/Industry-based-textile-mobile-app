using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class VClientBalance
{
    public Guid? ClientId { get; set; }

    public string? Name { get; set; }

    public decimal? Balance { get; set; }
}
