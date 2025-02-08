using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace api.Data
{
    public class ApplicationDBContext : IdentityDbContext<Account>
    {
        public ApplicationDBContext(DbContextOptions dbContextOptions)
            : base(dbContextOptions)
        {
        }

        public DbSet<JobPosting> JobPostings { get; set; }
        public DbSet<ApplyForm> ApplyForms { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<Employer> Employers { get; set; }
        public DbSet<SampleCV> SampleCVs { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Policy> Policies { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Candidate>()
                .HasOne(c => c.Account)
                .WithOne(a => a.Candidate)
                .HasForeignKey<Candidate>(c => c.CandidateID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Employer>()
                .HasOne(e => e.Account)
                .WithOne(a => a.Employer)
                .HasForeignKey<Employer>(e => e.EmployerID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ApplyForm>()
                .HasKey(p => new { p.JobPostingID, p.CandidateID });

            builder.Entity<SampleCV>()
                .HasKey(p => new { p.SampleID });

            builder.Entity<Contact>()
           .HasKey(p => new { p.ContactID });

            builder.Entity<Policy>()
                         .HasKey(p => new { p.PolicyID });
            builder.Entity<ApplyForm>()
                .HasOne(j => j.JobPosting)
                .WithMany(a => a.ApplyForms)
                .HasForeignKey(a => a.JobPostingID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<ApplyForm>()
                .HasOne(c => c.Candidate)
                .WithMany(a => a.ApplyForms)
                .HasForeignKey(a => a.CandidateID)
                .OnDelete(DeleteBehavior.NoAction);


            List<IdentityRole> roles = new List<IdentityRole>
            {
                new IdentityRole
                {
                    Name = "Admin",
                    NormalizedName = "ADMIN"
                },
                new IdentityRole
                {
                    Name = "Employer",
                    NormalizedName = "EMPLOYER"
                },
                new IdentityRole
                {
                    Name = "Candidate",
                    NormalizedName = "CANDIDATE"
                }
            };
            builder.Entity<IdentityRole>().HasData(roles);
        }
    }
}
