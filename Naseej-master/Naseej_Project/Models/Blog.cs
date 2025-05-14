using System;
using System.Collections.Generic;

namespace Naseej_Project.Models;

public partial class Blog
{
    public int BlogId { get; set; }

    public string Title { get; set; } = null!;

    public DateTime BlogDate { get; set; }

    public int EmployeeId { get; set; }

    public string? Image { get; set; }

    public string? Description { get; set; }

    public virtual Employee Employee { get; set; } = null!;
}
